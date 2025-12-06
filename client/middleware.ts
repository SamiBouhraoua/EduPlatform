import { NextResponse } from "next/server";

export function middleware(req: any) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .find((c: string) => c.trim().startsWith("token="))
    ?.split("=")[1] || null;

  const role = cookieHeader
    .split(";")
    .find((c: string) => c.trim().startsWith("role="))
    ?.split("=")[1] || null;

  const privateRoutes = ["/admin", "/teacher", "/student", "/parent"];

  // 1️⃣ NAVIGATION PRIVÉE : PROTÉGER LES ESPACES
  if (privateRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2️⃣ NAVIGATION PUBLIQUE : BLOQUER /login SI CONNECTÉ
  if (pathname === "/login" && token) {
    if (role === "teacher")
      return NextResponse.redirect(new URL("/teacher", req.url));

    if (role === "student")
      return NextResponse.redirect(new URL("/student", req.url));

    if (role === "parent")
      return NextResponse.redirect(new URL("/parent", req.url));

    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
  ],
};
