"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type FlaggedAccount = {
  id: string;
  user_id: string;
  reason: string;
  flagged_at: string;
};

type FlaggedListing = {
  id: string;
  title: string;
  company: string;
  flag_reasons: string[];
  created_at: string;
  employer_id: string;
};

export default function AdminFlaggedPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<FlaggedAccount[]>([]);
  const [listings, setListings] = useState<FlaggedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"listings" | "accounts">("listings");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/sign-in"); return; }

    const res = await fetch("/api/admin/flagged", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.status === 403) { router.replace("/dashboard"); return; }

    if (!res.ok) {
      setError("Failed to load flagged items.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as {
      flaggedAccounts: FlaggedAccount[];
      flaggedListings: FlaggedListing[];
    };

    setAccounts(data.flaggedAccounts);
    setListings(data.flaggedListings);
    setLoading(false);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function act(type: "account" | "listing", id: string, action: "approve" | "reject") {
    setActing(id);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/admin/flagged", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type, id, action }),
    });

    setActing(null);
    if (type === "listing") {
      setListings((prev) => prev.filter((l) => l.id !== id));
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">C</span>
            <span className="text-base font-semibold text-neutral-900">Admin</span>
          </a>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Flagged review
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Flagged items</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} · {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mb-5 flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 w-fit">
          {(["listings", "accounts"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-[#1D9E75] text-white" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t === "listings" ? `Listings (${listings.length})` : `Accounts (${accounts.length})`}
            </button>
          ))}
        </div>

        {tab === "listings" && (
          <div className="space-y-3">
            {listings.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white py-12 text-center text-sm text-neutral-500">
                No flagged listings
              </p>
            )}
            {listings.map((l) => (
              <div key={l.id} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">{l.title}</p>
                    <p className="text-sm text-neutral-600">{l.company}</p>
                    <ul className="mt-2 space-y-0.5">
                      {(l.flag_reasons ?? []).map((r) => (
                        <li key={r} className="flex items-start gap-1.5 text-xs text-amber-700">
                          <span className="mt-0.5 font-bold">!</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={acting === l.id}
                      onClick={() => void act("listing", l.id, "approve")}
                      className="rounded-xl bg-[#1D9E75] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#188a66] disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={acting === l.id}
                      onClick={() => void act("listing", l.id, "reject")}
                      className="rounded-xl border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "accounts" && (
          <div className="space-y-3">
            {accounts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white py-12 text-center text-sm text-neutral-500">
                No flagged accounts
              </p>
            )}
            {accounts.map((a) => (
              <div key={a.id} className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-neutral-500">{a.user_id}</p>
                    <p className="mt-1 text-sm text-neutral-900">{a.reason}</p>
                    <p className="text-xs text-neutral-500">
                      Flagged {new Date(a.flagged_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={acting === a.id}
                    onClick={() => void act("account", a.id, "approve")}
                    className="shrink-0 rounded-xl bg-[#1D9E75] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#188a66] disabled:opacity-50"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
