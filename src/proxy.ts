import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/deck(.*)"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();
	const path = req.nextUrl.pathname;

	if (userId && (path === "/" || isAuthRoute(req))) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: ["/((?!_next|[^?]*\\..*).*)", "/(api|trpc)(.*)"],
};
