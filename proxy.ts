import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set([
  "/",
  "/sign-in",
  "/sign-up",
  "/employer/sign-in",
  "/employer/sign-up",
  "/forgot-password",
  "/jobs",
  "/internships",
  "/companies",
  "/pricing",
  "/salary-guide",
  "/ambassador",
]);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/employer/dashboard",
  "/employer/post-job",
  "/employer/edit-job",
  "/admin",
];

const EMPLOYER_PREFIXES = [
  "/employer/dashboard",
  "/employer/post-job",
  "/employer/edit-job",
];

function isPublic(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  if (path.startsWith("/jobs/")) return true;
  if (path.startsWith("/internships/")) return true;
  return false;
}

function requiresAuth(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

function requiresEmployer(path: string): boolean {
  return EMPLOYER_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("sb-access-token")?.value
    ?? req.cookies.get("sb-gzphkfrbrcnpbcgsqrzd-auth-token")?.value;

  if (!accessToken) {
    const loginPath = requiresEmployer(pathname)
      ? "/employer/sign-in"
      : "/sign-in";
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|ico|svg)$).*)"],
};
