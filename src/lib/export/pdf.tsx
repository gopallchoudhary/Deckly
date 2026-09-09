import {
	Document,
	Image as PdfImage,
	Page,
	StyleSheet,
	Text,
	View,
	renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";

import {
	exportColors,
	fetchSlideImage,
	type ExportDeck,
	type SlideImageFormat,
} from "@/lib/export/shared";

const PAGE_W = 1600;
const PAGE_H = 900;
const IMAGE_PANEL_W = 800;
const PAD = 88;

const styles = StyleSheet.create({
	page: {
		flexDirection: "row",
		backgroundColor: "#ffffff",
		fontFamily: "Helvetica",
	},
	textColumn: {
		width: PAGE_W - IMAGE_PANEL_W,
		padding: PAD,
		paddingTop: PAD + 60,
	},
	title: {
		fontSize: 44,
		fontWeight: 700,
		color: exportColors.ink,
		marginBottom: 48,
	},
	bulletRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 20,
	},
	bulletMarker: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: exportColors.mint,
		marginTop: 9,
		marginRight: 18,
	},
	bulletText: {
		fontSize: 24,
		lineHeight: 1.5,
		color: exportColors.steel,
		flex: 1,
	},
	imagePanel: {
		width: IMAGE_PANEL_W,
		height: PAGE_H,
		alignItems: "center",
		justifyContent: "center",
		borderLeftWidth: 1,
		borderLeftColor: exportColors.hairline,
		backgroundColor: "#ffffff",
	},
	image: {
		width: IMAGE_PANEL_W - PAD,
		height: PAGE_H - PAD * 2,
		objectFit: "contain",
	},
	placeholder: {
		width: IMAGE_PANEL_W - PAD,
		height: PAGE_H - PAD * 2,
		backgroundColor: exportColors.surface,
		borderWidth: 1,
		borderColor: exportColors.hairline,
		alignItems: "center",
		justifyContent: "center",
	},
	placeholderText: {
		fontSize: 64,
		color: "#d4d4d4",
		fontFamily: "Helvetica-Bold",
	},
});

function SlidePage({
	slide,
	index,
	image,
}: {
	slide: ExportDeck["slides"][number];
	index: number;
	image: { data: string; format: SlideImageFormat } | null;
}) {
	return (
		<Page size={[PAGE_W, PAGE_H]} style={styles.page}>
			<View style={styles.textColumn}>
				<Text style={styles.title}>{slide.title}</Text>
				<View>
					{slide.bullets.map((bullet, bulletIndex) => (
						<View key={bulletIndex} style={styles.bulletRow}>
							<View style={styles.bulletMarker} />
							<Text style={styles.bulletText}>{bullet}</Text>
						</View>
					))}
				</View>
			</View>
			<View style={styles.imagePanel}>
				{image ? (
					<PdfImage
						style={styles.image}
						src={{ uri: `data:image/${image.format};base64,${image.data}` }}
					/>
				) : (
					<View style={styles.placeholder}>
						<Text style={styles.placeholderText}>
							{String(index + 1).padStart(2, "0")}
						</Text>
					</View>
				)}
			</View>
		</Page>
	);
}

export async function buildPdf(deck: ExportDeck): Promise<Buffer> {
	// @react-pdf/renderer is synchronous once rendering starts, so all async
	// work (fonts, remote images) must complete before the render pass.
	try {
		const { Font } = await import("@react-pdf/renderer");
		Font.register({
			family: "Inter",
			src: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5n-wU.woff2",
		});
	} catch {
		// Registration failed — fall back to the built-in Helvetica family.
	}

	const images = await Promise.all(
		deck.slides.map((slide) =>
			slide.imageUrl ? fetchSlideImage(slide.imageUrl) : Promise.resolve(null),
		),
	);

	const doc = (
		<Document title={deck.title} author="Deckly">
			{deck.slides.map((slide, index) => (
				<SlidePage
					key={index}
					slide={slide}
					index={index}
					image={images[index] ?? null}
				/>
			))}
		</Document>
	);

	return renderToBuffer(doc);
}
