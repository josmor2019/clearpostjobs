const DANGEROUS = /[<>"'`]/g;
const REPLACE_MAP: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;",
};

export function escapeHtml(value: string): string {
  return value.replace(DANGEROUS, (c) => REPLACE_MAP[c] ?? c);
}

export function sanitizeText(value: unknown, maxLen = 5000): string {
  if (typeof value !== "string") return "";
  return escapeHtml(value.trim()).slice(0, maxLen);
}

export function sanitizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
}

export function sanitizeInt(value: unknown, min = 0, max = 10_000_000): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export function sanitizeSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 100);
}
