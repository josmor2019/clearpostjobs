import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Warn loudly when misconfigured, but don't crash the JS bundle.
// createClient throws on empty/falsy URL or key, which prevents React from
// hydrating the page and leaves all buttons non-interactive on production.
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseKey)) {
  console.error(
    "[Clearpost] NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
    "Go to Vercel → Project → Settings → Environment Variables, add both values, then redeploy."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "placeholder-anon-key"
);

// Sync the session access token into a cookie so the server-side middleware
// (proxy.ts) can read it. Handles sign-in, token refresh, and sign-out.
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      const maxAge = session.expires_in ?? 3600;
      const secure = location.protocol === "https:" ? "; secure" : "";
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
    } else if (event === "SIGNED_OUT") {
      document.cookie = "sb-access-token=; path=/; max-age=0";
    }
  });
}
