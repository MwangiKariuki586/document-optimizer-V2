import { GoogleGenAI } from "@google/genai";

const documentText = `Alex Mwangi is a full-stack developer building React, Next.js, Supabase, and workflow products for fast-moving teams.
His resume explains broad technical experience, but some sentences are dense and the skills section needs clearer formatting.`;

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
  Analyze this document text and return:
  1. clarity issues
  2. tone issues
  3. structure suggestions
  
  Document:
"${documentText}"
  `,
  });

  console.log(response.text);
}

main().catch((error) => {
  console.error("[test-gemini]", error);
  process.exit(1);
});
