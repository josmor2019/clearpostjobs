import { NextResponse } from "next/server";

export const runtime = "nodejs";

type MatchRequest = {
  userSkills?: string[];
  userTitle?: string;
  jobTitle?: string;
  jobSkills?: string[];
  jobDescription?: string;
};

function computeMatchScore(req: MatchRequest): number {
  const userSkillsLower = (req.userSkills ?? []).map((s) => s.toLowerCase().trim());
  const jobSkillsLower = (req.jobSkills ?? []).map((s) => s.toLowerCase().trim());
  const userTitleLower = (req.userTitle ?? "").toLowerCase();
  const jobTitleLower = (req.jobTitle ?? "").toLowerCase();
  const descLower = (req.jobDescription ?? "").toLowerCase();

  let score = 40;

  if (userSkillsLower.length > 0 && jobSkillsLower.length > 0) {
    const matched = userSkillsLower.filter((s) => jobSkillsLower.includes(s)).length;
    const skillRatio = matched / jobSkillsLower.length;
    score += Math.round(skillRatio * 35);
  }

  if (userTitleLower && jobTitleLower) {
    const userWords = new Set(userTitleLower.split(/\W+/).filter(Boolean));
    const jobWords = jobTitleLower.split(/\W+/).filter(Boolean);
    const titleMatches = jobWords.filter((w) => userWords.has(w)).length;
    if (titleMatches > 0) score += Math.min(titleMatches * 5, 15);
  }

  if (userSkillsLower.length > 0 && descLower) {
    const descMatches = userSkillsLower.filter((s) => descLower.includes(s)).length;
    score += Math.min(descMatches * 2, 10);
  }

  return Math.min(Math.max(score, 30), 99);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MatchRequest;
    const score = computeMatchScore(body);
    return NextResponse.json({ score });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
