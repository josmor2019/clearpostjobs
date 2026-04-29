"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Internships", href: "/internships" },
  { label: "Companies", href: "#companies" },
  { label: "Salary Guide", href: "#salary" },
  { label: "Pricing", href: "/pricing" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on route change (ESC key)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span
          className={`absolute block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
            open ? "translate-y-0 rotate-45" : "-translate-y-1.5"
          }`}
        />
        <span
          className={`absolute block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${
            open ? "translate-y-0 -rotate-45" : "translate-y-1.5"
          }`}
        />
      </button>

      {/* Overlay + drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="fixed inset-x-0 top-[57px] z-50 border-b border-neutral-100 bg-white shadow-xl md:hidden"
            role="dialog"
            aria-label="Navigation menu"
          >
            <nav className="flex flex-col divide-y divide-neutral-100 px-4 py-2">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center py-3.5 text-base font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2 border-t border-neutral-100 px-4 pb-4 pt-3">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
              >
                Get started free →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
