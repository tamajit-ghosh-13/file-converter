import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/home",
]);

const isPublicApiRoutes = createRouteMatcher(["/api/video"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);

  const isAccessingDashboard = currentUrl.pathname === "\home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // loggedIn yet trying to access public routes
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // not loggedIn
  if (!userId) {
    // not loggedIn trying to access private routes
    if (!isPublicRoute(req) && !isPublicApiRoutes(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    // not loggedIn trying to access api routes
    if (isApiRequest && !isPublicApiRoutes(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
