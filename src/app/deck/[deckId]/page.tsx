import { notFound } from "next/navigation";
import { getDeck } from "@/features/decks/actions";
import { AppHeader } from "@/features/decks/components/app-header";
import { DeckViewer } from "@/features/slides/components/deck-viewer";

export default async function DeckPage({
	params,
}: {
	params: Promise<{ deckId: string }>;
}) {
	const { deckId } = await params;
	const deck = await getDeck(deckId);

	if (!deck) notFound();

	return (
		<div className="min-h-dvh bg-background">
			<AppHeader />
			<main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
				<DeckViewer initial={deck} />
			</main>
		</div>
	);
}
