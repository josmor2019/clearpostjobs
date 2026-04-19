import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 py-16 font-sans text-neutral-900 antialiased">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D9E75] text-base font-bold text-white shadow-sm">
            C
          </span>
          <span className="text-xl font-semibold tracking-tight text-[#1D9E75]">
            Clearpost
          </span>
        </Link>

        <p className="mt-10 text-7xl font-bold tracking-tight text-[#1D9E75] sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been moved
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] sm:flex-none sm:min-w-[140px]"
          >
            Go home
          </Link>
          <Link
            href="/jobs"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border-2 border-[#1D9E75]/50 bg-white px-5 py-2.5 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-[#1D9E75]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] sm:flex-none sm:min-w-[140px]"
          >
            Browse jobs
          </Link>
        </div>

        <p className="mt-8">
          <a
            href="#"
            className="text-sm font-medium text-neutral-500 underline-offset-4 transition-colors hover:text-[#1D9E75] hover:underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
