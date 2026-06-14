import { GoogleGenAI } from "@google/genai";

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
  "Our product helps teams work better. It is good and useful and improves things."
  `,
  });

  console.log(response.text);
}

main().catch((error) => {
  console.error("[test-gemini]", error);
  process.exit(1);
});