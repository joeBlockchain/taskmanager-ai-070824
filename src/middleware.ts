import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create a matcher for API routes
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Check if it's an API route
  if (isApiRoute(req)) {
    const { userId } = auth();

    // If there's no authenticated user
    if (!userId) {
      // Return a custom error response
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please sign in to access this API.",
        },
        { status: 401 }
      );
    }
    // If authenticated, allow the request to proceed
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
