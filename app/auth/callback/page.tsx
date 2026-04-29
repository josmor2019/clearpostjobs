"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = params.get("code");
    const next = params.get("next") ?? "/dashboard";
    const errorParam = params.get("error");

    const destination = next.startsWith("/") ? next : "/dashboard";

    if (errorParam) {
      router.replace(`/sign-in?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (code) {
      // PKCE flow: browser client has the stored code verifier
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? "/sign-in?error=auth_failed" : destination);
      });
      return;
    }

    // Implicit / magic-link flow: Supabase JS handles the hash fragment automatically
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? destination : "/sign-in?error=auth_failed");
    });
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1D9E75] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-neutral-600">Completing sign in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
