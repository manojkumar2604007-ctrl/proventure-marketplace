import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = (token?.role as string) || "CUSTOMER";
    const status = (token?.status as string) || "ACTIVE";

    // 1. Check account suspension status
    if (status === "SUSPENDED" && !pathname.startsWith("/login")) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "AccountSuspended");
      return NextResponse.redirect(url);
    }

    // 2. Admin Portal Protection (/admin/*)
    // ONLY users with role ADMIN can enter
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        // Forbidden: redirect non-admin away or show forbidden
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", "AdminAccessDenied");
        return NextResponse.redirect(url);
      }
    }

    // 3. Seller Portal Protection (/seller/*)
    // Public route: /seller/register allows customers to apply
    // All other /seller routes require role SELLER or ADMIN
    if (pathname.startsWith("/seller") && !pathname.startsWith("/seller/register")) {
      if (role !== "SELLER" && role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/seller/register"; // Redirect to onboarding
        return NextResponse.redirect(url);
      }
    }

    // 4. Customer Portal Protection (/customer/*)
    // Requires any authenticated user
    if (pathname.startsWith("/customer")) {
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't need authentication in middleware
        if (
          pathname === "/" ||
          pathname.startsWith("/products") ||
          pathname.startsWith("/cart") ||
          pathname.startsWith("/checkout") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/forgot-password") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/verify-email") ||
          pathname.startsWith("/seller/register") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/api/payments")
        ) {
          return true;
        }

        // Protected routes require valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/customer/:path*",
    "/api/admin/:path*",
    "/api/seller/:path*",
  ],
};
