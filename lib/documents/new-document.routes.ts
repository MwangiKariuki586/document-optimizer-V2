export type NewDocumentTab = "upload" | "paste";

export const NEW_DOCUMENT_PATH = "/documents/new";

const NEW_DOCUMENT_TABS: NewDocumentTab[] = ["upload", "paste"];

export function isNewDocumentTab(value: string): value is NewDocumentTab {
  return NEW_DOCUMENT_TABS.includes(value as NewDocumentTab);
}

export function parseNewDocumentTab(
  value: string | null | undefined,
): NewDocumentTab {
  if (value && isNewDocumentTab(value)) {
    return value;
  }

  return "upload";
}

export function newDocumentHref(tab: NewDocumentTab = "upload"): string {
  if (tab === "upload") {
    return NEW_DOCUMENT_PATH;
  }

  return `${NEW_DOCUMENT_PATH}?tab=${tab}`;
}
