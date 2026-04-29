import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Factor = {
  type: "skills" | "title" | "experience" | "location" | "education";
  label: string;
  impact: "high" | "medium" | "low";
  detail: string;
  action: string;
};

type BreakdownRequest = {
  userSkills?: string;
  userTitle?: string;
  userLocation?: string;
  userYearsExperience?: number;
  jobTitle?: string;
  jobSkills?: string;
  jobDescription?: string;
  jobLocation?: string;
  jobLocationType?: string;
  jobExperience?: string;
  jobSalary?: string;
};

function parseSkills(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|/\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 1);
}

function computeBreakdown(req: BreakdownRequest): { score: number; factors: Factor[] } {
  const userSkills = parseSkills(req.userSkills);
  const jobSkills = parseSkills(req.jobSkills);
  const userTitle = (req.userTitle ?? "").toLowerCase();
  const jobTitle = (req.jobTitle ?? "").toLowerCase();
  const userLocation = (req.userLocation ?? "").toLowerCase();
  const jobLocation = (req.jobLocation ?? "").toLowerCase();
  const jobLocationType = (req.jobLocationType ?? "").toLowerCase();
  const jobExperience = (req.jobExperience ?? "").toLowerCase();
  const desc = (req.jobDescription ?? "").toLowerCase();
  const yearsExp = req.userYearsExperience ?? 0;

  let score = 40;
  const factors: Factor[] = [];

  // Skills gap
  if (jobSkills.length > 0) {
    const matched = userSkills.filter((s) => jobSkills.includes(s));
    const missing = jobSkills.filter((s) => !userSkills.includes(s));
    const ratio = matched.length / jobSkills.length;
    score += Math.round(ratio * 35);

    if (missing.length > 0) {
      const topMissing = missing.slice(0, 3).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
      factors.push({
        type: "skills",
        label: "Missing required skills",
        impact: missing.length >= 3 ? "high" : missing.length >= 2 ? "medium" : "low",
        detail: `This role lists ${jobSkills.length} required skills. You're missing: ${topMissing.join(", ")}${missing.length > 3 ? ` +${missing.length - 3} more` : ""}.`,
        action: `Add ${topMissing[0]} to your skills profile. Even a side project counts — include it in your experience.`,
      });
    }
  } else if (desc && userSkills.length > 0) {
    const descMatches = userSkills.filter((s) => desc.includes(s)).length;
    score += Math.min(descMatches * 3, 20);
  }

  // Title alignment
  if (userTitle && jobTitle) {
    const userWords = new Set(userTitle.split(/\W+/).filter(Boolean));
    const jobWords = jobTitle.split(/\W+/).filter(Boolean);
    const matches = jobWords.filter((w) => userWords.has(w)).length;
    score += Math.min(matches * 5, 15);

    const seniorityMismatch =
      (jobTitle.includes("senior") || jobTitle.includes("staff") || jobTitle.includes("lead")) &&
      !userTitle.includes("senior") && !userTitle.includes("staff") && !userTitle.includes("lead") && !userTitle.includes("principal");

    if (seniorityMismatch) {
      factors.push({
        type: "title",
        label: "Title level gap",
        impact: "medium",
        detail: `This is a ${req.jobTitle} role. Your profile title is "${req.userTitle}". Hiring managers filter by seniority.`,
        action: "Reframe your title in your profile to reflect senior-level scope, even if your current title doesn't say it.",
      });
    }
  }

  // Experience gap
  const expMap: Record<string, number> = { entry: 1, junior: 2, mid: 3, senior: 5, staff: 8, principal: 10 };
  const requiredYears = Object.entries(expMap).reduce((acc, [key, val]) => {
    if (jobExperience.includes(key) || desc.includes(key)) return Math.max(acc, val);
    return acc;
  }, 0);

  if (requiredYears > 0 && yearsExp > 0 && yearsExp < requiredYears) {
    const gap = requiredYears - yearsExp;
    score -= Math.min(gap * 3, 12);
    factors.push({
      type: "experience",
      label: "Experience gap",
      impact: gap >= 3 ? "high" : "medium",
      detail: `Role targets ${requiredYears}+ years of experience. Your profile indicates ~${yearsExp} years.`,
      action: "Lead with the breadth of impact in your summary, not just tenure. Scope and ownership matter more than years.",
    });
  }

  // Location mismatch
  const isOnSite = jobLocationType.includes("on-site") || (jobLocationType === "" && jobLocation !== "" && !jobLocation.includes("remote"));
  const isRemote = jobLocationType.includes("remote") || jobLocation.includes("remote");

  if (!isRemote && isOnSite && userLocation && jobLocation) {
    const userCity = userLocation.split(/[,/]+/)[0]?.trim() ?? "";
    const jobCity = jobLocation.split(/[,/]+/)[0]?.trim() ?? "";
    if (userCity && jobCity && !jobLocation.includes(userCity) && !userLocation.includes(jobCity)) {
      score -= 8;
      factors.push({
        type: "location",
        label: "Location mismatch",
        impact: "medium",
        detail: `You're listed in ${req.userLocation}. This role is on-site in ${req.jobLocation}.`,
        action: "If you're open to relocating or are already moving, say so explicitly in your cover letter.",
      });
    }
  }

  const finalScore = Math.min(Math.max(score, 22), 99);

  // If no factors found but score is high, show what's working
  if (factors.length === 0 && finalScore >= 75) {
    factors.push({
      type: "skills",
      label: "Strong skills alignment",
      impact: "low",
      detail: "Your skills closely match what this role requires.",
      action: "Use your cover letter to highlight the top 3 matching skills with a specific example for each.",
    });
  }

  return { score: finalScore, factors };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`match-breakdown:${ip}`, 60, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit reached." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  try {
    const body = (await request.json()) as BreakdownRequest;
    const { score, factors } = computeBreakdown(body);
    return NextResponse.json({ score, factors });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
