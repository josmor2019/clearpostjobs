import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

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

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const rl = rateLimit(`ai:resume:${user.id}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Try again in an hour." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  try {
    const body = (await request.json()) as ResumeRequest;

    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 254);
    const title = sanitizeText(body.title, 100);
    const targetRole = sanitizeText(body.targetRole, 100);
    const summary = sanitizeText(body.summary, 1000);
    const experience = sanitizeText(body.experience, 3000);
    const education = sanitizeText(body.education, 1000);
    const skills = sanitizeText(body.skills, 500);

    const prompt = `You are an expert resume writer. Create a polished, ATS-optimized resume in Markdown format for the following person.

Name: ${name || "Not provided"}
Email: ${email || "Not provided"}
Current/Target Title: ${title || "Not provided"}
Target Role: ${targetRole || title || "Not provided"}
Professional Summary: ${summary || "Not provided"}
Work Experience: ${experience || "Not provided"}
Education: ${education || "Not provided"}
Skills: ${skills || "Not provided"}

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
