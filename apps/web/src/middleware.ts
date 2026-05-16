import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/transactions",
  "/kyc",
  "/payments",
  "/disputes",
  "/notifications",
  "/settings",
  "/admin",
  "/agents",
];

const publicApiPathPrefixes = [
  "/api/webhooks/",
  "/api/fx-rates",
];

const cronApiPaths = [
  "/api/fx-rates/cron",
  "/api/inspections/cron",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isPublicApi = publicApiPathPrefixes.some((route) => pathname.startsWith(route));
  const isCronApi = cronApiPaths.includes(pathname);
  const isProtected = protectedPaths.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  ) || (isApi && !isPublicApi && !isCronApi);

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
