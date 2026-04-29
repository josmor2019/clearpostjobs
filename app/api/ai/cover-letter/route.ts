import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as CoverLetterRequest;
    const tone = body.tone ?? "professional";

    const prompt = `You are an expert cover letter writer. Write a compelling, ${tone} cover letter for the following job application.

Applicant: ${body.name ?? "Applicant"}
Email: ${body.email ?? ""}
Job Title: ${body.jobTitle ?? "Not provided"}
Company: ${body.company ?? "Not provided"}
Job Description: ${body.jobDescription ?? "Not provided"}
Applicant Background: ${body.userBackground ?? "Not provided"}

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
