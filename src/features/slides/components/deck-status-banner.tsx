"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckStatusChip } from "@/features/decks/components/deck-status-chip";
import { useRetryDeck } from "@/features/decks/hooks/use-decks";

export function DeckStatusBanner({
	deckId,
	status,
	errorMessage,
}: {
	deckId: string;
	status: string;
	errorMessage: string | null;
}) {
	const retryDeck = useRetryDeck();

	if (status === "COMPLETE") return null;

	if (status === "FAILED") {
		return (
			<div className="flex flex-col gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1.5">
					<DeckStatusChip status={status} />
					<p className="text-sm text-destructive">
						{errorMessage ?? "Generation failed. Try again."}
					</p>
				</div>
				<Button
					disabled={retryDeck.isPending}
					onClick={() => retryDeck.mutate(deckId)}
					className="shrink-0 rounded-full"
				>
					{retryDeck.isPending && (
						<Loader2Icon className="animate-spin" aria-hidden />
					)}
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4 rounded-lg border bg-card p-6">
			<div className="flex items-center gap-3">
				<Loader2Icon className="size-4 animate-spin text-brand" aria-hidden />
				<div>
					<p className="text-sm font-semibold">Writing your deck…</p>
					<p className="text-sm text-muted-foreground">
						Generating slides and imagery — this page updates automatically.
					</p>
				</div>
				<DeckStatusChip status={status} className="ml-auto" />
			</div>
			<Skeleton className="aspect-video w-full rounded-md" />
		</div>
	);
}
