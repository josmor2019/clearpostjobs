import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ResumeRequest = {
  name?: string;
  email?: string;
  title?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  targetRole?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as ResumeRequest;

    const prompt = `You are an expert resume writer. Create a polished, ATS-optimized resume in Markdown format for the following person.

Name: ${body.name ?? "Not provided"}
Email: ${body.email ?? "Not provided"}
Current/Target Title: ${body.title ?? "Not provided"}
Target Role: ${body.targetRole ?? body.title ?? "Not provided"}
Professional Summary: ${body.summary ?? "Not provided"}
Work Experience: ${body.experience ?? "Not provided"}
Education: ${body.education ?? "Not provided"}
Skills: ${body.skills ?? "Not provided"}

Write a complete, professional resume. Use clear sections: Summary, Experience, Education, Skills. Use action verbs. Be concise and impactful. Format in clean Markdown.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ai/resume] OpenAI error", err);
      return NextResponse.json({ error: "AI generation failed." }, { status: 502 });
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content ?? "";
    return NextResponse.json({ resume: content });
  } catch (err) {
    console.error("[ai/resume]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
