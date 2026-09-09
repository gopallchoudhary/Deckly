"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DeckCard } from "@/features/decks/components/deck-card";
import type { DeckSummary } from "@/features/decks/actions";

export function DeckGrid({ decks }: { decks: DeckSummary[] | undefined }) {
	if (!decks) {
		return (
			<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="aspect-[4/3] rounded-lg bg-background" />
				))}
			</div>
		);
	}

	if (decks.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-10 text-center">
				<h3 className="text-sm font-semibold">No decks yet</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Describe your first idea above — Deckly turns it into slides.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
			{decks.map((deck) => (
				<DeckCard key={deck.id} deck={deck} />
			))}
		</div>
	);
}
