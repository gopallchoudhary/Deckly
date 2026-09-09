import PptxGenJS from "pptxgenjs";

import {
	exportColors,
	fetchSlideImage,
	type ExportDeck,
} from "@/lib/export/shared";

const PAGE_W = 10;
const PAGE_H = 5.625;
const IMAGE_PANEL_W = 5;
const TEXT_PAD = 0.55;
const GAP = 0.3;

export async function buildPptx(deck: ExportDeck): Promise<Buffer> {
	const pptx = new PptxGenJS();

	pptx.layout = "LAYOUT_16x9";
	pptx.title = deck.title;
	pptx.author = "Deckly";

	for (const slide of deck.slides) {
		const pptxSlide = pptx.addSlide();
		pptxSlide.background = { color: "FFFFFF" };

		// Divider between text column and image panel
		pptxSlide.addShape("line", {
			x: PAGE_W - IMAGE_PANEL_W,
			y: 0,
			w: 0,
			h: PAGE_H,
			line: { color: exportColors.hairline.replace("#", ""), width: 1 },
		});

		// Left column — title + bullets
		pptxSlide.addText(slide.title, {
			x: TEXT_PAD,
			y: 0.6,
			w: PAGE_W - IMAGE_PANEL_W - GAP - TEXT_PAD,
			h: 0.9,
			fontSize: 24,
			fontFace: "Calibri",
			bold: true,
			color: exportColors.ink.replace("#", ""),
			valign: "top",
		});

		const bullets = slide.bullets.map((bullet) => ({
			text: bullet,
			options: {
				bullet: { characterCode: "2022" },
				color: exportColors.steel.replace("#", ""),
				bulletColor: exportColors.mint.replace("#", ""),
			},
		}));

		if (bullets.length > 0) {
			pptxSlide.addText(bullets, {
				x: TEXT_PAD,
				y: 1.7,
				w: PAGE_W - IMAGE_PANEL_W - GAP - TEXT_PAD,
				h: PAGE_H - 1.7 - TEXT_PAD,
				fontSize: 14,
				fontFace: "Calibri",
				lineSpacingMultiple: 1.4,
				valign: "top",
			});
		}

		// Right panel — image (contain) or placeholder
		const imageData = slide.imageUrl
			? await fetchSlideImage(slide.imageUrl)
			: null;

		if (imageData) {
			pptxSlide.addImage({
				data: `image/${imageData.format};base64,${imageData.data}`,
				x: PAGE_W - IMAGE_PANEL_W + GAP,
				y: GAP,
				w: IMAGE_PANEL_W - GAP * 2,
				h: PAGE_H - GAP * 2,
				sizing: { type: "contain", w: IMAGE_PANEL_W - GAP * 2, h: PAGE_H - GAP * 2 },
			});
		} else {
			pptxSlide.addShape("rect", {
				x: PAGE_W - IMAGE_PANEL_W + GAP,
				y: GAP,
				w: IMAGE_PANEL_W - GAP * 2,
				h: PAGE_H - GAP * 2,
				fill: { color: exportColors.surface.replace("#", "") },
				line: { color: exportColors.hairline.replace("#", ""), width: 1 },
			});
		}

		pptxSlide.addNotes(`Idea: ${deck.idea}\nImage prompt: ${slide.imageUrl ?? "n/a"}`);
	}

	return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}
