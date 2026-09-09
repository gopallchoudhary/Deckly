import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/deck(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

	if (req.nextUrl.pathname === "/" && userId) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: ["/((?!_next|[^?]*\\..*).*)", "/(api|trpc)(.*)"],
};
