import { NextResponse } from "next/server";

import { getDeck } from "@/features/decks/actions";
import { sanitizeFilename, toExportDeck } from "@/lib/export/shared";
import { buildPptx } from "@/lib/export/pptx";
import { buildPdf } from "@/lib/export/pdf";

export const runtime = "nodejs";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ deckId: string }> },
) {
	const { deckId } = await params;
	const format = new URL(request.url).searchParams.get("format");

	if (format !== "pptx" && format !== "pdf") {
		return NextResponse.json(
			{ error: "format must be pptx or pdf" },
			{ status: 400 },
		);
	}

	let deck;
	try {
		deck = await getDeck(deckId);
	} catch {
		return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
	}

	if (!deck) {
		return NextResponse.json({ error: "Deck not found." }, { status: 404 });
	}
	if (deck.status !== "COMPLETE") {
		return NextResponse.json(
			{ error: "Deck is not ready for export." },
			{ status: 400 },
		);
	}

	try {
		const exportDeck = toExportDeck(deck);
		const buffer =
			format === "pptx" ? await buildPptx(exportDeck) : await buildPdf(exportDeck);

		const extension = format === "pptx" ? "pptx" : "pdf";
		const contentType =
			format === "pptx"
				? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
				: "application/pdf";

		return new Response(new Uint8Array(buffer), {
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `attachment; filename="${sanitizeFilename(deck.title)}.${extension}"`,
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Export failed:", error);
		return NextResponse.json({ error: "Export failed." }, { status: 500 });
	}
}
