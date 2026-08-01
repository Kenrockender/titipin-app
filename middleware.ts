import { type NextRequest, NextResponse } from "next/server";

// The Bouncer. In production this refreshes the Supabase session and gates /admin
// to your admin email (NEXT_PUBLIC_ADMIN_EMAIL). In mock mode there is no server
// session, so the client-side guard in app/admin/layout.tsx enforces access and
// this middleware is a no-op passthrough.
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.next(); // mock mode

  // --- When Supabase is connected, uncomment and use @supabase/ssr here: ---
  // const res = NextResponse.next();
  // const supabase = createServerClient(url, anon, { cookies: {...res} });
  // const { data: { user } } = await supabase.auth.getUser();
  // if (request.nextUrl.pathname.startsWith("/admin")) {
  //   const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  //   if (!user || user.email !== adminEmail) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  // }
  // return res;
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
