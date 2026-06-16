import type {
  CreateExportOptions,
  ExportFormat,
} from "@/lib/export/export.validators";

type ExportRenderInput = {
  title: string;
  markdown: string;
  format: ExportFormat;
  options: CreateExportOptions;
  fidelityStatus: string;
  wordCount: number;
};

type RenderedExport = {
  data: Buffer;
  contentType: string;
};

const CONTENT_TYPES: Record<ExportFormat, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  markdown: "text/markdown",
  txt: "text/plain",
  html: "text/html",
};

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}

function escapePdfText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\r", "")
    .replaceAll("\n", " ");
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function buildDocumentBody(input: ExportRenderInput): string {
  const sections = [input.markdown.trim() || "This document is empty."];

  if (input.options.addSummary) {
    sections.push(
      [
        "Export Summary",
        `Title: ${input.title}`,
        `Words: ${input.wordCount}`,
        `Fidelity: ${input.fidelityStatus}`,
      ].join("\n"),
    );
  }

  if (input.options.addMetadata) {
    sections.push(
      [
        "Export Metadata",
        `Generated: ${new Date().toISOString()}`,
        `Format: ${input.format.toUpperCase()}`,
        `Page size: ${input.options.pageSize}`,
        `Margins: ${input.options.margins}`,
        `Image quality: ${input.options.imageQuality}`,
        `Watermark: ${input.options.watermark}`,
      ].join("\n"),
    );
  }

  return sections.join("\n\n");
}

function renderMarkdown(input: ExportRenderInput): Buffer {
  return Buffer.from(buildDocumentBody(input), "utf8");
}

function renderText(input: ExportRenderInput): Buffer {
  return Buffer.from(stripMarkdown(buildDocumentBody(input)), "utf8");
}

function renderHtml(input: ExportRenderInput): Buffer {
  const body = buildDocumentBody(input)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("\n");

  return Buffer.from(
    [
      "<!doctype html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="utf-8">',
      `<title>${escapeHtml(input.title)}</title>`,
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "</head>",
      "<body>",
      `<main>${body}</main>`,
      "</body>",
      "</html>",
    ].join("\n"),
    "utf8",
  );
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: Array<{ path: string; data: Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.path, "utf8");
    const checksum = crc32(file.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(file.data.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, file.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(file.data.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + file.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localData = Buffer.concat(localParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localData.length, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([localData, centralDirectory, end]);
}

function renderDocx(input: ExportRenderInput): Buffer {
  const paragraphs = buildDocumentBody(input)
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`,
    )
    .join("");

  return createZip([
    {
      path: "[Content_Types].xml",
      data: Buffer.from(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
        "utf8",
      ),
    },
    {
      path: "_rels/.rels",
      data: Buffer.from(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
        "utf8",
      ),
    },
    {
      path: "word/document.xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`,
        "utf8",
      ),
    },
  ]);
}

function renderPdf(input: ExportRenderInput): Buffer {
  const lines = stripMarkdown(buildDocumentBody(input))
    .split("\n")
    .flatMap((line) => {
      const chunks = line.match(/.{1,88}/g);
      return chunks ?? [""];
    })
    .slice(0, 42);

  const textCommands = [
    "BT",
    "/F1 11 Tf",
    "50 770 Td",
    `(${escapePdfText(input.title)}) Tj`,
    "0 -24 Td",
    ...lines.flatMap((line) => [
      `(${escapePdfText(line)}) Tj`,
      "0 -15 Td",
    ]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(textCommands, "utf8")} >>\nstream\n${textCommands}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}

export function renderExport(input: ExportRenderInput): RenderedExport {
  const renderers: Record<ExportFormat, () => Buffer> = {
    docx: () => renderDocx(input),
    pdf: () => renderPdf(input),
    markdown: () => renderMarkdown(input),
    txt: () => renderText(input),
    html: () => renderHtml(input),
  };

  return {
    data: renderers[input.format](),
    contentType: CONTENT_TYPES[input.format],
  };
}
