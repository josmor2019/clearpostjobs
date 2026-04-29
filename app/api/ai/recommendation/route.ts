import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

type RecommendationRequest = {
  studentName?: string;
  studentEmail?: string;
  professorName?: string;
  course?: string;
  relationship?: string;
  achievements?: string;
  targetProgram?: string;
  tone?: "formal" | "warm" | "enthusiastic";
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`ai:rec:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Try again in an hour." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  try {
    const body = (await request.json()) as RecommendationRequest;

    const studentName = sanitizeText(body.studentName, 100);
    const studentEmail = sanitizeText(body.studentEmail, 254);
    const professorName = sanitizeText(body.professorName, 100);
    const course = sanitizeText(body.course, 200);
    const relationship = sanitizeText(body.relationship, 500);
    const achievements = sanitizeText(body.achievements, 2000);
    const targetProgram = sanitizeText(body.targetProgram, 200);
    const tone = body.tone ?? "formal";

    const prompt = `You are a university professor writing a ${tone} letter of recommendation. Write a compelling, specific recommendation letter.

Student: ${studentName || "the student"}
Student Email: ${studentEmail || "not provided"}
Professor: ${professorName || "Professor"}
Course/Subject: ${course || "not provided"}
How you know them: ${relationship || "not provided"}
Key achievements and qualities: ${achievements || "not provided"}
Target program/opportunity: ${targetProgram || "not provided"}

Write a 3-4 paragraph recommendation letter. Opening: introduce yourself and your relationship with the student. Second paragraph: specific academic achievements and intellectual qualities. Third paragraph: personal qualities, leadership, collaboration. Closing: enthusiastic endorsement with contact info offer. Use formal academic language. Do not use hollow phrases like "it is my pleasure." Be specific and genuine. Format as plain text.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI generation failed." }, { status: 502 });
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content ?? "";
    return NextResponse.json({ letter: content });
  } catch (err) {
    console.error("[ai/recommendation]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
