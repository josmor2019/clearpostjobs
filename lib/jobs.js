export const JOBS = [
  {
    id: "1",
    company: "Stripe",
    title: "Software Engineer, Payments Platform",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    salaryMin: 198000,
    salaryMax: 265000,
    jobType: "Full-time",
    experience: "Senior",
    posted: "2026-04-14",
  },
  {
    id: "2",
    company: "Notion",
    title: "Product Engineer, Growth",
    location: "Remote (US)",
    locationType: "Remote",
    salaryMin: 175000,
    salaryMax: 230000,
    jobType: "Full-time",
    experience: "Mid",
    posted: "2026-04-13",
  },
  {
    id: "3",
    company: "Vercel",
    title: "Developer Experience Engineer",
    location: "Remote (Global)",
    locationType: "Remote",
    salaryMin: 160000,
    salaryMax: 210000,
    jobType: "Full-time",
    experience: "Mid",
    posted: "2026-04-12",
  },
  {
    id: "4",
    company: "Linear",
    title: "Staff Frontend Engineer",
    location: "San Francisco, CA",
    locationType: "On-site",
    salaryMin: 220000,
    salaryMax: 290000,
    jobType: "Full-time",
    experience: "Staff",
    posted: "2026-04-11",
  },
  {
    id: "5",
    company: "Figma",
    title: "Software Engineer, Editor Performance",
    location: "New York, NY",
    locationType: "Hybrid",
    salaryMin: 185000,
    salaryMax: 245000,
    jobType: "Full-time",
    experience: "Senior",
    posted: "2026-04-10",
  },
  {
    id: "6",
    company: "Anthropic",
    title: "Machine Learning Engineer, Inference",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    salaryMin: 240000,
    salaryMax: 320000,
    jobType: "Contract",
    experience: "Senior",
    posted: "2026-04-09",
  },
];

export function formatSalary(min, max) {
  const fmt = (n) =>
    n >= 1000
      ? `$${Math.round(n / 1000)}k`
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

export function formatPosted(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
