"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function onBoardUser() {
	const user = await currentUser();
	if (!user) return null;

	const email =
		user.primaryEmailAddress?.emailAddress ??
		user.emailAddresses[0]?.emailAddress ??
		null;

	const name =
		user.fullName ??
		([user.firstName, user.lastName].filter(Boolean).join(" ") || null);

	return prisma.user.upsert({
		where: { clerkId: user.id },
		update: {
			email,
			firstName: user.firstName,
			lastName: user.lastName,
			name,
			imageUrl: user.imageUrl,
		},
		create: {
			clerkId: user.id,
			email,
			firstName: user.firstName,
			lastName: user.lastName,
			name,
			imageUrl: user.imageUrl,
		},
	});
}

export async function getCurrentUser() {
	const user = await currentUser();
	if (!user) return null;

	try {
		return await prisma.user.findUnique({
			where: { clerkId: user.id },
		});
	} catch (error) {
		console.error("Failed to fetch current user:", error);
		return null;
	}
}