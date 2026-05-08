import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

type DetectRequest = {
  text?: string;
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

  const rl = rateLimit(`ai:detect:${user.id}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Try again in an hour." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  try {
    const body = (await request.json()) as DetectRequest;
    const text = body.text?.trim();
    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Text too short for analysis." }, { status: 400 });
    }

    const prompt = `You are an expert in detecting AI-generated text. Analyze the following text and determine the likelihood it was written by an AI.

Text to analyze:
"""
${text.slice(0, 2000)}
"""

Respond ONLY with valid JSON in this exact format:
{
  "aiScore": <number 0-100>,
  "verdict": "<Human-written|Likely human|Mixed|Likely AI|AI-generated>",
  "signals": ["<signal 1>", "<signal 2>", "<signal 3>"],
  "recommendation": "<brief actionable advice>"
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI detection failed." }, { status: 502 });
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content) as Record<string, unknown>;
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/detect]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
