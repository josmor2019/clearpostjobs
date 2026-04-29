import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

type CoverLetterRequest = {
  name?: string;
  email?: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  userBackground?: string;
  tone?: "professional" | "friendly" | "bold";
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`ai:cover:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Try again in an hour." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  try {
    const body = (await request.json()) as CoverLetterRequest;
    const tone = body.tone ?? "professional";

    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 254);
    const jobTitle = sanitizeText(body.jobTitle, 100);
    const company = sanitizeText(body.company, 100);
    const jobDescription = sanitizeText(body.jobDescription, 2000);
    const userBackground = sanitizeText(body.userBackground, 2000);

    const prompt = `You are an expert cover letter writer. Write a compelling, ${tone} cover letter for the following job application.

Applicant: ${name || "Applicant"}
Email: ${email || ""}
Job Title: ${jobTitle || "Not provided"}
Company: ${company || "Not provided"}
Job Description: ${jobDescription || "Not provided"}
Applicant Background: ${userBackground || "Not provided"}

Write a 3-4 paragraph cover letter. Opening: grab attention with genuine enthusiasm. Middle: connect skills to the role with specific examples. Closing: confident call to action. Keep it under 350 words. Do not use clichés like "I am writing to express my interest." Format as plain text (no markdown headers).`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.75,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI generation failed." }, { status: 502 });
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content ?? "";
    return NextResponse.json({ coverLetter: content });
  } catch (err) {
    console.error("[ai/cover-letter]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
