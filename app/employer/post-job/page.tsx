"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
const LOCATION_TYPES = ["On-site", "Remote", "Hybrid"] as const;
const EXPERIENCE_LEVELS = [
  "Entry-level",
  "Mid-level",
  "Senior",
  "Executive",
] as const;

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[#1D9E75]/10 text-[#188a66]"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      {label}
    </a>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

const selectClass =
  "w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

export default function EmployerPostJobPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState<(typeof JOB_TYPES)[number]>("Full-time");
  const [locationType, setLocationType] =
    useState<(typeof LOCATION_TYPES)[number]>("Remote");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experience, setExperience] =
    useState<(typeof EXPERIENCE_LEVELS)[number]>("Mid-level");
  const [skills, setSkills] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user: nextUser },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!nextUser) {
        router.replace("/employer/sign-in");
        return;
      }

      setUser(nextUser);
      setAuthChecked(true);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/employer/sign-in");
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    if (!current) {
      router.replace("/employer/sign-in");
      return;
    }

    const min = Number(salaryMin);
    const max = Number(salaryMax);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      setError("Please enter valid salary min and max.");
      return;
    }

    if (!companyName.trim()) {
      setError("Company name is required");
      return;
    }

    const skillsInput = skills;

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/employer/sign-in"); return; }

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        job_type: jobType,
        location_type: locationType,
        location: location.trim(),
        salary_min: min,
        salary_max: max,
        experience,
        skills: skillsInput,
        company: companyName,
      }),
    });

    setLoading(false);

    const data = (await res.json()) as {
      jobId?: string;
      status?: string;
      flagged?: boolean;
      message?: string;
      error?: string;
    };

    if (!res.ok) {
      setError(data.error ?? "Failed to post job.");
      return;
    }

    if (data.flagged) {
      setError(data.message ?? "Your listing is under review.");
      // Still redirect — listing was created, just held for review
    }

    router.push("/employer/dashboard");
  }

  if (!authChecked || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-600">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white p-5 lg:block">
        <a href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">
            Clearpost
          </span>
        </a>

        <nav className="space-y-1">
          <NavLink href="/employer/dashboard" label="Dashboard" />
          <NavLink href="/employer/post-job" label="Post a Job" active />
          <NavLink href="/employer/dashboard#my-job-listings" label="My Listings" />
          <NavLink href="/employer/dashboard#candidates" label="Candidates" />
          <NavLink href="/employer/dashboard#settings" label="Settings" />
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            Sign out
          </button>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              Post a job
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div>
              <label
                htmlFor="job-title"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Job title
              </label>
              <input
                id="job-title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Company name{" "}
                <span className="text-red-600" aria-hidden>
                  *
                </span>
              </label>
              <input
                id="company-name"
                name="companyName"
                type="text"
                autoComplete="organization"
                aria-required="true"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (error === "Company name is required") setError(null);
                }}
                placeholder="Your company name as it should appear on the listing"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="job-description"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Job description
              </label>
              <textarea
                id="job-description"
                name="description"
                required
                rows={12}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and what you are looking for."
                className={`${inputClass} min-h-[240px] resize-y`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="job-type"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Job type
                </label>
                <select
                  id="job-type"
                  name="jobType"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as (typeof JOB_TYPES)[number])}
                  className={selectClass}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
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
                  name="locationType"
                  value={locationType}
                  onChange={(e) =>
                    setLocationType(e.target.value as (typeof LOCATION_TYPES)[number])
                  }
                  className={selectClass}
                >
                  {LOCATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote (US)"
                className={inputClass}
              />
            </div>

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
                  name="salaryMin"
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="120000"
                  className={inputClass}
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
                  name="salaryMax"
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="180000"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="experience"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Experience level
              </label>
              <select
                id="experience"
                name="experience"
                value={experience}
                onChange={(e) =>
                  setExperience(e.target.value as (typeof EXPERIENCE_LEVELS)[number])
                }
                className={selectClass}
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="skills"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Skills
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-neutral-500">Comma separated</p>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Posting…" : "Post Job"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

