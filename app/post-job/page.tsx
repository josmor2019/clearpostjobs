"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

type LocationType = "Remote" | "On-site" | "Hybrid";
type ListingType = "standard" | "featured";

type FormState = {
  jobTitle: string;
  department: string;
  jobType: string;
  locationType: LocationType;
  cityState: string;
  description: string;
  experienceLevel: string;
  yearsExperience: string;
  education: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  salaryMin: string;
  salaryMax: string;
  payPeriod: string;
  currency: string;
  benefits: string[];
  listingType: ListingType;
};

const INITIAL_FORM: FormState = {
  jobTitle: "",
  department: "",
  jobType: "",
  locationType: "Remote",
  cityState: "",
  description: "",
  experienceLevel: "",
  yearsExperience: "",
  education: "",
  mustHaveSkills: [],
  niceToHaveSkills: [],
  salaryMin: "",
  salaryMax: "",
  payPeriod: "Annual",
  currency: "USD",
  benefits: [],
  listingType: "standard",
};

const BENEFIT_OPTIONS = [
  "Health insurance",
  "Dental",
  "Vision",
  "401k",
  "Equity",
  "Unlimited PTO",
  "Remote work stipend",
  "Learning budget",
] as const;

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a skill and press Enter"
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
      />
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#1D9E75]/10 px-2.5 py-1 text-xs font-medium text-[#188a66]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full p-0.5 hover:bg-[#1D9E75]/20"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const STEPS = ["Job Details", "Requirements", "Compensation", "Review & Post"] as const;

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleBenefit = (name: string) => {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(name)
        ? prev.benefits.filter((b) => b !== name)
        : [...prev.benefits, name],
    }));
  };

  const showCityState =
    form.locationType === "On-site" || form.locationType === "Hybrid";

  const progressPercent = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-neutral-900 antialiased">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">
              C
            </span>
            <span className="font-semibold text-[#1D9E75]">Clearpost</span>
          </a>
          <a
            href="/dashboard/employer"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Dashboard
          </a>
        </div>
      </header>

      <div className="w-full bg-[#1D9E75] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Post a Job
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
            Verified listings with salary transparency—complete all steps to submit
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <div className="mb-3 flex justify-between text-xs font-medium text-neutral-500">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={
                  i + 1 === step
                    ? "font-semibold text-[#1D9E75]"
                    : i + 1 < step
                      ? "text-neutral-700"
                      : ""
                }
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-[#1D9E75] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-md shadow-neutral-900/5 sm:p-8">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">Job Details</h2>
              <div>
                <label
                  htmlFor="job-title"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Job title
                </label>
                <input
                  id="job-title"
                  value={form.jobTitle}
                  onChange={(e) => update("jobTitle", e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Department
                </label>
                <select
                  id="department"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="job-type"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Job type
                </label>
                <select
                  id="job-type"
                  value={form.jobType}
                  onChange={(e) => update("jobType", e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="location-type"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Location type
                </label>
                <select
                  id="location-type"
                  value={form.locationType}
                  onChange={(e) =>
                    update("locationType", e.target.value as LocationType)
                  }
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              {showCityState ? (
                <div>
                  <label
                    htmlFor="city-state"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    City / State
                  </label>
                  <input
                    id="city-state"
                    value={form.cityState}
                    onChange={(e) => update("cityState", e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                </div>
              ) : null}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Job description
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={8}
                  placeholder="Describe the role, team, impact, and what success looks like. Include responsibilities, tools, and collaboration style."
                  className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm leading-relaxed outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">Requirements</h2>
              <div>
                <label
                  htmlFor="exp-level"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Experience level
                </label>
                <select
                  id="exp-level"
                  value={form.experienceLevel}
                  onChange={(e) => update("experienceLevel", e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="">Select level</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff">Staff</option>
                  <option value="Director">Director</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="years"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Years of experience
                </label>
                <select
                  id="years"
                  value={form.yearsExperience}
                  onChange={(e) => update("yearsExperience", e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="">Select range</option>
                  <option value="0-1">0-1</option>
                  <option value="1-3">1-3</option>
                  <option value="3-5">3-5</option>
                  <option value="5-10">5-10</option>
                  <option value="10+">10+</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="education"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Education
                </label>
                <select
                  id="education"
                  value={form.education}
                  onChange={(e) => update("education", e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="">Select education</option>
                  <option value="No requirement">No requirement</option>
                  <option value="Bachelor's">Bachelor&apos;s</option>
                  <option value="Master's">Master&apos;s</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <TagInput
                label="Must-have skills"
                tags={form.mustHaveSkills}
                onAdd={(tag) =>
                  setForm((p) => ({ ...p, mustHaveSkills: [...p.mustHaveSkills, tag] }))
                }
                onRemove={(tag) =>
                  setForm((p) => ({
                    ...p,
                    mustHaveSkills: p.mustHaveSkills.filter((t) => t !== tag),
                  }))
                }
              />
              <TagInput
                label="Nice-to-have skills"
                tags={form.niceToHaveSkills}
                onAdd={(tag) =>
                  setForm((p) => ({ ...p, niceToHaveSkills: [...p.niceToHaveSkills, tag] }))
                }
                onRemove={(tag) =>
                  setForm((p) => ({
                    ...p,
                    niceToHaveSkills: p.niceToHaveSkills.filter((t) => t !== tag),
                  }))
                }
              />
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex min-w-[100px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-neutral-900">Compensation</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="salary-min"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Salary min
                  </label>
                  <input
                    id="salary-min"
                    type="text"
                    inputMode="decimal"
                    value={form.salaryMin}
                    onChange={(e) => update("salaryMin", e.target.value)}
                    placeholder="150000"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="salary-max"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Salary max
                  </label>
                  <input
                    id="salary-max"
                    type="text"
                    inputMode="decimal"
                    value={form.salaryMax}
                    onChange={(e) => update("salaryMax", e.target.value)}
                    placeholder="220000"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pay-period"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Pay period
                  </label>
                  <select
                    id="pay-period"
                    value={form.payPeriod}
                    onChange={(e) => update("payPeriod", e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="currency"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-neutral-700">
                  Benefits
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BENEFIT_OPTIONS.map((b) => (
                    <label
                      key={b}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50/80 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.benefits.includes(b)}
                        onChange={() => toggleBenefit(b)}
                        className="h-4 w-4 rounded border-neutral-300 text-[#1D9E75] focus:ring-[#1D9E75]"
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">Listing type</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => update("listingType", "standard")}
                    className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                      form.listingType === "standard"
                        ? "border-[#1D9E75] bg-[#1D9E75]/5"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <p className="font-semibold text-neutral-900">Standard</p>
                    <p className="mt-1 text-sm text-neutral-600">Free</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => update("listingType", "featured")}
                    className={`relative rounded-2xl border-2 p-4 text-left transition-colors ${
                      form.listingType === "featured"
                        ? "border-[#1D9E75] bg-[#1D9E75]/10"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <span className="absolute right-3 top-3 rounded-full bg-[#1D9E75] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Most Popular
                    </span>
                    <p className="font-semibold text-[#188a66]">Featured</p>
                    <p className="mt-1 text-sm text-neutral-700">$299/month</p>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex min-w-[100px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">Review & Post</h2>
              <div className="space-y-4 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Job
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {form.jobTitle || "—"} · {form.department || "—"} ·{" "}
                    {form.jobType || "—"}
                  </p>
                  <p className="mt-1 text-neutral-600">
                    {form.locationType}
                    {showCityState && form.cityState ? ` · ${form.cityState}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Description
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-neutral-700">
                    {form.description || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Requirements
                  </p>
                  <p className="mt-1 text-neutral-700">
                    {form.experienceLevel || "—"} · {form.yearsExperience || "—"} years ·{" "}
                    {form.education || "—"}
                  </p>
                  <p className="mt-1 text-neutral-600">
                    Must-have:{" "}
                    {form.mustHaveSkills.length ? form.mustHaveSkills.join(", ") : "—"}
                  </p>
                  <p className="mt-0.5 text-neutral-600">
                    Nice-to-have:{" "}
                    {form.niceToHaveSkills.length
                      ? form.niceToHaveSkills.join(", ")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Compensation
                  </p>
                  <p className="mt-1 font-medium text-[#1D9E75]">
                    {form.salaryMin || "—"} – {form.salaryMax || "—"} {form.currency} /{" "}
                    {form.payPeriod.toLowerCase()}
                  </p>
                  <p className="mt-1 text-neutral-600">
                    Benefits:{" "}
                    {form.benefits.length ? form.benefits.join(", ") : "None selected"}
                  </p>
                  <p className="mt-1 text-neutral-600">
                    Listing:{" "}
                    {form.listingType === "featured"
                      ? "Featured ($299/month)"
                      : "Standard (free)"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-neutral-900">
                  Before you post, confirm:
                </p>
                <ul className="space-y-2">
                  {[
                    "Salary range is accurate and will be shown on the listing",
                    "Role is actively hiring and responsibilities are up to date",
                    "You agree to Clearpost verification and quality guidelines",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75] text-white">
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          aria-hidden
                        >
                          <path
                            d="M3 8l3 3 7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex min-w-[100px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  className="inline-flex min-w-[160px] flex-1 items-center justify-center rounded-xl bg-[#1D9E75] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#188a66] sm:flex-none"
                >
                  Post Job
                </button>
              </div>
              <p className="text-center text-xs text-neutral-500">
                Your listing will be verified by our team within 24 hours
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
