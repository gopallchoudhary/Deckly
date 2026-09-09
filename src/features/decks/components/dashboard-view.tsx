"use client";

import { DeckForm } from "@/features/decks/components/deck-form";
import { DeckGrid } from "@/features/decks/components/deck-grid";
import { useDecks } from "@/features/decks/hooks/use-decks";

export function DashboardView() {
	const { data: decks } = useDecks();

	return (
		<section className="rounded-4xl border bg-muted px-6 py-12 sm:px-12 sm:py-16">
			<h1 className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
				Turn a prompt into a pitch deck.
			</h1>

			<DeckForm />

			<div className="mt-16">
				<h2 className="text-[11px] font-semibold tracking-[0.5px] uppercase text-muted-foreground">
					Decks
				</h2>
				<div className="mt-4">
					<DeckGrid decks={decks} />
				</div>
			</div>
		</section>
	);
}
