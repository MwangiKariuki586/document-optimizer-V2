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
"Alex Mwangi | Full stack developer



Email: mwangikariuki586@gmail.com



GitHub: https://github.com/MwangiKariuki586



Phone: +254758606346



Personal Portfolio: https://alex-mwangi-portfolio.vercel.app/







PROFILE SUMMARY







Full Stack Engineer with experience building and improving products across backend, web, and user-facing workflows. Growing within the fast-moving environment at Digital Qatalyst has sharpened both my technical range and the way I solve problems with ownership and adaptability. This experience has taught me to turn changing requirements into clean, practical solutions and to build quickly without compromising maintainability, scalability, or user experience.







WORK EXPERIENCE







Digital Qatalyst, Fullstack developer	April 2024 – present







Built and maintained full-stack features across marketplace, community, workflow, and enterprise platform modules, contributing to scalable web products in a fast-moving Agile environment.



Developed responsive user interfaces using React and Next.js, implementing reusable component patterns that improved consistency, maintainability, and feature delivery speed.



Designed and integrated backend APIs to support service discovery, bookings, product catalogs, user engagement workflows, analytics, moderation, and role-based access control.



Implemented authentication and RBAC-driven workflows to support secure user interactions across multiple user roles and permission levels.



Improved platform reliability by implementing validation layers, API safeguards, rate limiting, structured error handling, and performance optimizations.



Optimized data-driven workflows, API response handling, and frontend rendering patterns to improve responsiveness and user experience.



Collaborated with product, design, and technical teams to translate changing business requirements into scalable, production-ready solutions.



Contributed to technical discussions around maintainability, system scalability, implementation tradeoffs, and long-term platform evolution.







EDUCATION







KCA University	May 2018 – Nov 2021







Bachelor of Science in Information Technology (BSc IT)



Relevant Coursework: Web Development, Data Structures and Algorithms, Database Management



TECHNICAL SKILLS







Back-End: ExpressJs, Supabase, WordPress CMS



Front-End: React, NextJs, Javascript, Tailwind, HTML, CSS



Databases: MySQL, PostgresSQL, MongoDB



Cloud Platforms: Azure



Tools: Git, Docker



"
  `,
  });

  console.log(response.text);
}

main().catch((error) => {
  console.error("[test-gemini]", error);
  process.exit(1);
});