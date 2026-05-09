import { formatPosted, formatSalary } from "@/lib/jobs";

// Deterministic color per company name
const LOGO_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
];

function hashCompany(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

function initials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function MatchBadge({ score }) {
  const colorClass =
    score >= 80
      ? "bg-[#1D9E75]/10 text-[#147b5b] ring-[#1D9E75]/20"
      : score >= 60
        ? "bg-amber-50 text-amber-700 ring-amber-200/60"
        : "bg-neutral-100 text-neutral-500 ring-neutral-200/60";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ring-1 ${colorClass}`}>
      {score}% match
    </span>
  );
}

/**
 * @param {{
 *   job: import("@/app/jobs/page").UiJob,
 *   titleTag?: string,
 *   matchScore?: number | null,
 *   responseStats?: { responseRate: number; avgDays: number | null } | null,
 *   applicantCount?: number | null,
 *   isSaved?: boolean,
 *   onSaveToggle?: (jobId: string, save: boolean) => void
 * }} props
 */
export function JobCard({ job, titleTag = "h2", matchScore = null, responseStats = null, applicantCount = null, isSaved = false, onSaveToggle = null }) {
  const Title = titleTag;
  const logoColor = hashCompany(job.company);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-neutral-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Company logo placeholder */}
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-wide ${logoColor}`}>
            {initials(job.company)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-800">{job.company}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
                <path d="M6 1a3.5 3.5 0 010 7 3.5 3.5 0 010-7zM6 11c-2.5 0-4.5-.7-4.5-1.5S3.5 8 6 8s4.5.7 4.5 1.5S8.5 11 6 11z" fill="currentColor" />
              </svg>
              {job.location}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {matchScore != null && <MatchBadge score={matchScore} />}
          <span className="rounded-full bg-[#1D9E75]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#188a66]">
            Verified
          </span>
        </div>
      </div>

      {/* Title */}
      <Title className="mt-3 text-[15px] font-semibold leading-snug text-neutral-900 group-hover:text-[#1D9E75] transition-colors">
        {job.title}
      </Title>

      {/* Salary — the key differentiator */}
      <p className="mt-2 text-base font-bold text-[#1D9E75]">
        {formatSalary(job.salaryMin, job.salaryMax)}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
          {job.jobType}
        </span>
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
          {job.locationType}
        </span>
        {job.experience && (
          <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
            {job.experience}
          </span>
        )}
      </div>

      {/* Live applicant count */}
      {applicantCount != null && applicantCount > 0 && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-orange-600">
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
            <path d="M6 1.5C6 1.5 4 3 4 4.5a2 2 0 104 0C8 3 6 1.5 6 1.5z" fill="currentColor" />
            <path d="M2.5 8C1.7 8.2 1 8.6 1 9s.9 1 2 1M9.5 8c.8.2 1.5.6 1.5 1s-.9 1-2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M4 7.5C2.8 8 2 8.4 2 9s1.3 1 4 1 4-.4 4-1-1.2-1-2-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          {applicantCount} applied in 24h
        </p>
      )}

      {/* Response rate */}
      {responseStats != null && (
        <p className={`mt-2.5 inline-flex w-fit items-center gap-1 text-[11px] font-medium ${responseStats.responseRate >= 70 ? "text-[#147b5b]" : responseStats.responseRate >= 40 ? "text-amber-700" : "text-neutral-400"}`}>
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 3.5v2.75l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {responseStats.avgDays != null
            ? `${responseStats.responseRate}% respond within ${responseStats.avgDays}d`
            : `${responseStats.responseRate}% response rate`}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 flex items-center justify-between gap-3">
        <span className="text-[11px] text-neutral-400">
          {formatPosted(job.posted)}
        </span>
        <div className="flex items-center gap-2">
          {onSaveToggle && (
            <button
              type="button"
              onClick={() => onSaveToggle(job.id, !isSaved)}
              aria-label={isSaved ? "Unsave job" : "Save job"}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${isSaved ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]" : "border-neutral-200 bg-white text-neutral-400 hover:border-[#1D9E75]/50 hover:text-[#1D9E75]"}`}
            >
              <svg viewBox="0 0 20 20" fill={isSaved ? "currentColor" : "none"} className="h-4 w-4" aria-hidden>
                <path d="M5 3h10v14l-5-2.5L5 17V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <a
            href={`/apply/${job.id}`}
            className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] active:scale-95"
          >
            Apply now
          </a>
        </div>
      </div>
    </article>
  );
}
