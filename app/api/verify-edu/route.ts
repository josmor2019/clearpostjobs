import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EDU_TLDS = new Set([".edu", ".edu.au", ".ac.uk", ".ac.in", ".edu.sg", ".edu.ca"]);

function isEduEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const atIdx = lower.lastIndexOf("@");
  if (atIdx < 0) return false;
  const domain = lower.slice(atIdx + 1);
  for (const tld of EDU_TLDS) {
    if (domain.endsWith(tld)) return true;
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim() ?? "";

    if (!email) {
      return NextResponse.json({ valid: false, reason: "No email provided." });
    }

    const isEdu = isEduEmail(email);
    return NextResponse.json({
      valid: isEdu,
      reason: isEdu ? "Verified .edu email" : "Not a recognized .edu domain",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
