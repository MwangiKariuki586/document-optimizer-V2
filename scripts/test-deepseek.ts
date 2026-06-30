const documentText = `Alex Mwangi is a full-stack developer building React, Next.js, Supabase, and workflow products for fast-moving teams.
His resume explains broad technical experience, but some sentences are dense and the skills section needs clearer formatting.`;

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY in .env.local");
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        {
          role: "user",
          content: `
  Analyze this document text and return:
  1. clarity issues
  2. tone issues
  3. structure suggestions
  
  Document:
"${documentText}"
  `,
        },
      ],
      temperature: 0.3,
      thinking: { type: "disabled" },
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${body}`);
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  console.log(body.choices?.[0]?.message?.content ?? "");
}

main().catch((error) => {
  console.error("[test-deepseek]", error);
  process.exit(1);
});
