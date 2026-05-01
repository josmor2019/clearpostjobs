import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gzphkfrbrcnpbcgsqrzd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cGhrZnJicmNucGJjZ3NxcnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDI5NjgsImV4cCI6MjA5MTE3ODk2OH0.74XZdEJRbatTpQAS4ixnjWitEqJNM_V73--Y-YbSi0k";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_ANON_KEY
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
