// Validates and optionally scans resume files before storage.
// Accepts multipart/form-data with field "file".
// Returns { safe: true } or { safe: false, reason: string }
// Set VIRUSTOTAL_API_KEY for real malware scanning; otherwise falls back to
// file-type and content heuristics only.

import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Naive heuristic: look for JS/VBA macro signatures in raw bytes
function containsMacroSignature(buffer: Uint8Array): boolean {
  const text = Buffer.from(buffer).toString("latin1");
  return (
    text.includes("AutoOpen") ||
    text.includes("Document_Open") ||
    text.includes("<script") ||
    text.includes("javascript:") ||
    text.includes("vbaProject.bin")
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`resume-scan:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { safe: false, reason: "Rate limit reached." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ safe: false, reason: "Invalid multipart request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ safe: false, reason: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { safe: false, reason: "Only PDF and DOCX files are accepted." },
      { status: 422 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { safe: false, reason: "File exceeds the 5 MB size limit." },
      { status: 422 },
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  if (containsMacroSignature(buffer)) {
    return NextResponse.json(
      { safe: false, reason: "File contains potentially malicious content (macros or scripts) and was rejected." },
      { status: 422 },
    );
  }

  // Optional: VirusTotal scan
  const vtKey = process.env.VIRUSTOTAL_API_KEY;
  if (vtKey) {
    try {
      const vtForm = new FormData();
      vtForm.append("file", new Blob([buffer], { type: file.type }), file.name);

      const uploadRes = await fetch("https://www.virustotal.com/api/v3/files", {
        method: "POST",
        headers: { "x-apikey": vtKey },
        body: vtForm,
      });

      if (uploadRes.ok) {
        const uploadData = (await uploadRes.json()) as { data?: { id?: string } };
        const analysisId = uploadData.data?.id;

        if (analysisId) {
          // Poll once after 5s — in production use a queue/webhook instead
          await new Promise((r) => setTimeout(r, 5000));
          const reportRes = await fetch(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            { headers: { "x-apikey": vtKey } },
          );

          if (reportRes.ok) {
            const report = (await reportRes.json()) as {
              data?: { attributes?: { stats?: { malicious?: number } } };
            };
            const malicious = report.data?.attributes?.stats?.malicious ?? 0;
            if (malicious > 0) {
              return NextResponse.json(
                { safe: false, reason: "File was flagged by antivirus scanning and cannot be uploaded." },
                { status: 422 },
              );
            }
          }
        }
      }
    } catch (err) {
      console.error("[resume/scan] VirusTotal error", err);
      // Fall through — don't block upload if VT is unavailable
    }
  }

  return NextResponse.json({ safe: true });
}
