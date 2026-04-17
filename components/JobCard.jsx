import { formatPosted, formatSalary } from "@/lib/jobs";

export function JobCard({ job, titleTag = "h2" }) {
  const Title = titleTag;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-900">{job.company}</p>
        <span className="shrink-0 rounded-full bg-[#1D9E75]/12 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#188a66]">
          Verified
        </span>
      </div>
      <Title className="mt-2 text-lg font-semibold leading-snug text-neutral-900">
        {job.title}
      </Title>
      <p className="mt-2 text-sm text-neutral-600">{job.location}</p>
      <p className="mt-3 text-base font-semibold text-[#1D9E75]">
        {formatSalary(job.salaryMin, job.salaryMax)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
          {job.jobType}
        </span>
        <span className="inline-flex rounded-lg border border-neutral-100 bg-white px-2.5 py-1 text-xs text-neutral-500">
          {job.locationType}
        </span>
      </div>
      <p className="mt-4 text-xs text-neutral-400">
        Posted {formatPosted(job.posted)}
      </p>
      <div className="mt-auto flex pt-5">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
        >
          Apply
        </button>
      </div>
    </article>
  );
}
