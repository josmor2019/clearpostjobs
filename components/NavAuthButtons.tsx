"use client";

import { useRouter } from "next/navigation";

export function NavAuthButtons() {
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => router.push("/sign-in")}
        className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 sm:inline-flex"
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => router.push("/sign-up")}
        className="hidden rounded-xl bg-[#1D9E75] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] sm:inline-flex"
      >
        Get started →
      </button>
    </>
  );
}
