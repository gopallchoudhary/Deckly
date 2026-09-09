import type { DeckDetail } from "@/features/decks/actions";

export const EXPORT_IMAGE_TIMEOUT_MS = 10_000;

export const exportColors = {
	ink: "#0a0a0a",
	steel: "#5a5a5c",
	mint: "#00d4a4",
	mintDeep: "#00b48a",
	hairline: "#e5e5e5",
	surface: "#f7f7f7",
} as const;

export function parseBullets(content: string): string[] {
	return content
		.split("\n")
		.map((line) => line.trim().replace(/^•\s*/, ""))
		.filter(Boolean);
}

export function sanitizeFilename(title: string | null): string {
	const cleaned = (title ?? "")
		.normalize("NFKD")
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.toLowerCase();
	return cleaned || "deck";
}

export function withImageTransform(url: string): string {
	return `${url}?tr=w-1200,q-80`;
}

export async function fetchSlideImage(
	url: string,
): Promise<{ data: string; format: "png" } | null> {
	try {
		const response = await fetch(withImageTransform(url), {
			signal: AbortSignal.timeout(EXPORT_IMAGE_TIMEOUT_MS),
		});
		if (!response.ok) return null;

		const buffer = Buffer.from(await response.arrayBuffer());
		return { data: buffer.toString("base64"), format: "png" };
	} catch {
		return null;
	}
}

export type ExportSlide = {
	title: string;
	bullets: string[];
	imageUrl: string | null;
};

export type ExportDeck = {
	title: string;
	idea: string;
	slides: ExportSlide[];
};

export function toExportDeck(deck: DeckDetail): ExportDeck {
	return {
		title: deck.title ?? "Untitled deck",
		idea: deck.idea,
		slides: deck.slides.map((slide) => ({
			title: slide.title,
			bullets: parseBullets(slide.content),
			imageUrl: slide.imageUrl,
		})),
	};
}
