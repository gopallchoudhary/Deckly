import { notFound } from "next/navigation";
import { getDeck } from "@/features/decks/actions";
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
		<div className="mx-auto max-w-[1600px]">
			<DeckViewer initial={deck} />
		</div>
	);
}
