"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeckStatusChip } from "@/features/decks/components/deck-status-chip";
import { DeckStatusBanner } from "@/features/slides/components/deck-status-banner";
import { DeckWorkspace } from "@/features/slides/components/deck-workspace";
import { useDeck } from "@/features/decks/hooks/use-decks";
import type { DeckDetail } from "@/features/decks/actions";

export function DeckViewer({ initial }: { initial: DeckDetail }) {
	const { data } = useDeck(initial.id, initial);
	const deck = data ?? initial;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon-sm"
					render={<Link href="/dashboard" />}
					aria-label="Back to dashboard"
				>
					<ArrowLeftIcon aria-hidden />
				</Button>
				<div className="min-w-0">
					<h1 className="truncate text-lg font-semibold tracking-tight">
						{deck.title ?? "Untitled deck"}
					</h1>
				</div>
				<DeckStatusChip status={deck.status} className="ml-auto shrink-0" />
			</div>

			<DeckStatusBanner
				deckId={deck.id}
				status={deck.status}
				errorMessage={deck.errorMessage}
			/>

			{deck.status === "COMPLETE" && deck.slides.length > 0 && (
				<DeckWorkspace deck={deck} />
			)}

			{deck.status === "COMPLETE" && deck.slides.length === 0 && (
				<p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
					This deck has no slides yet.
				</p>
			)}
		</div>
	);
}
