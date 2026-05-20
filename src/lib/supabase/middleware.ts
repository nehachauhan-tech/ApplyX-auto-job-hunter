import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedPaths = ["/dashboard", "/profile", "/applications", "/settings", "/jobs", "/resumes"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/onboarding" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (isAuthPath || isProtectedPath)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, location, headline")
      .eq("id", user.id)
      .single();

    const needsOnboarding = !profile?.full_name || !profile?.phone || !profile?.location || !profile?.headline;

    if (isAuthPath) {
      const url = request.nextUrl.clone();
      url.pathname = needsOnboarding ? "/onboarding" : "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isProtectedPath && needsOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  if (user && pathname === "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, location, headline")
      .eq("id", user.id)
      .single();

    const needsOnboarding = !profile?.full_name || !profile?.phone || !profile?.location || !profile?.headline;

    if (!needsOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
