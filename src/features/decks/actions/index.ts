"use server";

import { prisma } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { DeckStatus } from "@/generated/prisma/client";
import { onBoardUser } from "@/features/auth/actions";

export type DeckSummary = {
	id: string;
	title: string | null;
	status: "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";
	errorMessage: string | null;
	slideCount: number;
	createdAt: string;
};

export type DeckDetail = Omit<DeckSummary, "slideCount"> & {
	idea: string;
	slides: {
		id: string;
		order: number;
		title: string;
		content: string;
		imageUrl: string | null;
	}[];
};

const MIN_IDEA_LENGTH = 20;
const MAX_IDEA_LENGTH = 2000;

async function requireDbUser() {
	const clerkUser = await currentUser();
	if (!clerkUser) throw new Error("You must be signed in.");

	const existing = await prisma.user.findUnique({
		where: { clerkId: clerkUser.id },
	});
	if (existing) return existing;

	const created = await onBoardUser();
	if (!created) throw new Error("Could not create your account. Try again.");
	return created;
}

async function requireOwnedDeck(deckId: string, userId: string) {
	const deck = await prisma.deck.findUnique({
		where: { id: deckId },
		select: { id: true, userId: true },
	});
	if (!deck || deck.userId !== userId) throw new Error("Deck not found.");
	return deck;
}

export async function createDeck(idea: string): Promise<{ id: string }> {
	const user = await requireDbUser();

	const trimmed = idea.trim();
	if (trimmed.length < MIN_IDEA_LENGTH) {
		throw new Error(`Project idea must be at least ${MIN_IDEA_LENGTH} characters.`);
	}
	if (trimmed.length > MAX_IDEA_LENGTH) {
		throw new Error(`Project idea must be at most ${MAX_IDEA_LENGTH} characters.`);
	}

	const deck = await prisma.deck.create({
		data: {
			userId: user.id,
			idea: trimmed,
			status: DeckStatus.PENDING,
		},
	});

	try {
		await inngest.send({
			name: "deck/generate",
			data: { deckId: deck.id },
		});
	} catch {
		await prisma.deck.update({
			where: { id: deck.id },
			data: {
				status: DeckStatus.FAILED,
				errorMessage: "Could not queue generation. Try again.",
			},
		});
		throw new Error("Could not queue generation. Try again.");
	}

	return { id: deck.id };
}

export async function listDecks(): Promise<DeckSummary[]> {
	const user = await requireDbUser();

	const decks = await prisma.deck.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			status: true,
			errorMessage: true,
			createdAt: true,
			_count: { select: { slides: true } },
		},
	});

	return decks.map((deck) => ({
		id: deck.id,
		title: deck.title,
		status: deck.status,
		errorMessage: deck.errorMessage,
		slideCount: deck._count.slides,
		createdAt: deck.createdAt.toISOString(),
	}));
}

export async function getDeck(deckId: string): Promise<DeckDetail | null> {
	const user = await requireDbUser();

	const deck = await prisma.deck.findUnique({
		where: { id: deckId },
		select: {
			id: true,
			userId: true,
			title: true,
			idea: true,
			status: true,
			errorMessage: true,
			createdAt: true,
			slides: {
				orderBy: { order: "asc" },
				select: {
					id: true,
					order: true,
					title: true,
					content: true,
					imageUrl: true,
				},
			},
		},
	});

	if (!deck || deck.userId !== user.id) return null;

	return {
		id: deck.id,
		title: deck.title,
		status: deck.status,
		errorMessage: deck.errorMessage,
		idea: deck.idea,
		createdAt: deck.createdAt.toISOString(),
		slides: deck.slides,
	};
}

export async function renameDeck(deckId: string, title: string): Promise<void> {
	const user = await requireDbUser();
	await requireOwnedDeck(deckId, user.id);

	const trimmed = title.trim();
	if (trimmed.length === 0) throw new Error("Title cannot be empty.");
	if (trimmed.length > 100) throw new Error("Title must be at most 100 characters.");

	await prisma.deck.update({
		where: { id: deckId },
		data: { title: trimmed },
	});
}

export async function deleteDeck(deckId: string): Promise<void> {
	const user = await requireDbUser();
	await requireOwnedDeck(deckId, user.id);

	await prisma.deck.delete({ where: { id: deckId } });
}

export async function updateSlide(
	deckId: string,
	slideId: string,
	data: { title: string; content: string },
): Promise<void> {
	const user = await requireDbUser();
	await requireOwnedDeck(deckId, user.id);

	const title = data.title.trim();
	const content = data.content.trim();
	if (title.length === 0) throw new Error("Title cannot be empty.");
	if (title.length > 120) throw new Error("Title must be at most 120 characters.");
	if (content.length === 0) throw new Error("Content cannot be empty.");
	if (content.length > 2000) throw new Error("Content must be at most 2000 characters.");

	const slide = await prisma.slide.findUnique({
		where: { id: slideId },
		select: { deckId: true },
	});
	if (!slide || slide.deckId !== deckId) throw new Error("Slide not found.");

	await prisma.slide.update({
		where: { id: slideId },
		data: { title, content },
	});
}

export async function retryDeck(deckId: string): Promise<void> {
	const user = await requireDbUser();
	await requireOwnedDeck(deckId, user.id);

	const deck = await prisma.deck.findUnique({
		where: { id: deckId },
		select: { status: true },
	});
	if (!deck || deck.status !== DeckStatus.FAILED) {
		throw new Error("Only failed decks can be retried.");
	}

	await prisma.deck.update({
		where: { id: deckId },
		data: { status: DeckStatus.PENDING, errorMessage: null },
	});

	try {
		await inngest.send({
			name: "deck/generate",
			data: { deckId },
		});
	} catch {
		await prisma.deck.update({
			where: { id: deckId },
			data: {
				status: DeckStatus.FAILED,
				errorMessage: "Could not queue generation. Try again.",
			},
		});
		throw new Error("Could not queue generation. Try again.");
	}
}
