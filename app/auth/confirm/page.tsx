"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as "signup" | "recovery" | null;

    if (!tokenHash || !type) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type })
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          setStatus("success");
          setTimeout(() => {
            router.replace(type === "recovery" ? "/reset-password" : "/dashboard");
          }, 2000);
        }
      });
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        {status === "loading" ? (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#1D9E75]" />
            <p className="text-sm text-neutral-600">Confirming your account…</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Account confirmed!</h1>
            <p className="mt-2 text-sm text-neutral-600">Redirecting you to your dashboard…</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Confirmation failed</h1>
            <p className="mt-2 text-sm text-neutral-600">{message}</p>
            <a href="/sign-in" className="mt-4 inline-flex rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]">
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  );
}
