export type ScanResult = {
  flagged: boolean;
  reasons: string[];
};

const SSN_PAT = /social\s*security|\bssn\b|taxpayer\s*id/i;
const PAYMENT_PAT =
  /wire\s*transfer|western\s*union|moneygram|pay.*(?:fee|deposit)|processing\s*fee|training\s*(?:cost|fee)|background\s*check\s*fee|send\s*(?:money|funds|payment)/i;
const PERSONAL_EMAIL_PAT =
  /@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|ymail)\./i;
const UNREALISTIC_THRESHOLD = 600_000;

export function scanListing(job: {
  title?: string;
  description?: string;
  company?: string;
  salary_min?: number;
  salary_max?: number;
  contact_email?: string;
}): ScanResult {
  const reasons: string[] = [];
  const text = `${job.title ?? ""} ${job.description ?? ""}`;

  if (SSN_PAT.test(text)) {
    reasons.push("Requests Social Security Number or taxpayer ID");
  }

  if (PAYMENT_PAT.test(text)) {
    reasons.push("Requests payment or financial information from applicants");
  }

  if (!job.company?.trim()) {
    reasons.push("No company name provided");
  }

  if ((job.salary_max ?? 0) > UNREALISTIC_THRESHOLD) {
    reasons.push(
      `Salary range appears unrealistically high ($${Math.round((job.salary_max ?? 0) / 1000)}k max)`,
    );
  }

  if (job.contact_email && PERSONAL_EMAIL_PAT.test(job.contact_email)) {
    reasons.push(
      "Contact email uses a personal domain (Gmail, Yahoo, etc.) instead of a company domain",
    );
  }

  return { flagged: reasons.length > 0, reasons };
}

export function extractEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase().trim() ?? "";
}

export function companyNameToDomain(companyName: string): string {
  return (
    companyName
      .toLowerCase()
      .replace(
        /\s+(inc|llc|ltd|corp|co|company|group|technologies|technology|solutions|services|consulting|labs|ventures)\.?\s*$/i,
        "",
      )
      .replace(/[^a-z0-9]/g, "") + ".com"
  );
}

export function domainMatchesCompany(
  emailDomain: string,
  companyName: string,
): boolean {
  if (!emailDomain || !companyName) return false;
  const expected = companyNameToDomain(companyName);
  return emailDomain === expected || emailDomain.endsWith("." + expected);
}
