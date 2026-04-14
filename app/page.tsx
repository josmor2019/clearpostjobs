export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white px-4 py-16 text-neutral-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center">
        <section className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl">
            The job board that only posts real jobs
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-zinc-400 sm:text-xl">
            Clearpost is a verified job board: every listing shows salary upfront
            and has been checked so it&apos;s still hiring—no ghost posts.
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="job-search" className="sr-only">
              Search jobs
            </label>
            <input
              id="job-search"
              type="search"
              name="q"
              placeholder="Search by role, company, or keyword"
              className="w-full flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm outline-none ring-[#1D9E75] ring-offset-2 ring-offset-white placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-500"
            />
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#1D9E75] px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
            >
              Sign up
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
