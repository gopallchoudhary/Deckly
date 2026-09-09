"use client";

import * as React from "react";
import { Maximize2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel";
import { useEmblaSelection } from "@/features/slides/hooks/use-embla-selection";
import { SlideRail } from "@/features/slides/components/slide-rail";
import { SlideView } from "@/features/slides/components/slide-view";
import { SlideEditor } from "@/features/slides/components/slide-editor";
import { CarouselDots } from "@/features/slides/components/carousel-dots";
import { FullscreenView } from "@/features/slides/components/fullscreen-view";
import { useUpdateSlide } from "@/features/decks/hooks/use-decks";
import type { DeckDetail } from "@/features/decks/actions";

export function DeckWorkspace({ deck }: { deck: DeckDetail }) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [collapsed, setCollapsed] = React.useState(false);
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	const updateSlide = useUpdateSlide();

	const { selected, count } = useEmblaSelection(api, () => setEditingId(null));
	const slides = deck.slides;

	function goTo(index: number) {
		api?.scrollTo(index);
	}

	function startEdit(slideId: string) {
		if (slides[selected]?.id !== slideId) goTo(slides.findIndex((s) => s.id === slideId));
		setEditingId(slideId);
	}

	function saveEdit(slideId: string, title: string, content: string) {
		updateSlide.mutate(
			{ deckId: deck.id, slideId, title, content },
			{ onSuccess: () => setEditingId(null) },
		);
	}

	return (
		<>
			<div className="rounded-4xl border bg-muted p-4 sm:p-6">
				<div className="flex min-h-[420px] gap-4">
					<SlideRail
						slides={slides}
						selected={selected}
						onSelect={goTo}
						collapsed={collapsed}
						onToggleCollapsed={() => setCollapsed((value) => !value)}
					/>
					<div className="hidden w-px shrink-0 bg-border md:block" aria-hidden />

					<div className="flex min-w-0 flex-1 flex-col">
						<div className="mb-4 flex items-center justify-between gap-3">
							<span className="font-mono text-xs text-muted-foreground">
								{String(selected + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
							</span>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full"
								onClick={() => setIsFullscreen(true)}
							>
								<Maximize2Icon aria-hidden />
								Present
							</Button>
						</div>

						<Carousel
							setApi={setApi}
							opts={{ loop: false, align: "start" }}
							className="min-w-0 flex-1"
						>
							<CarouselContent>
								{slides.map((slide) => (
									<CarouselItem key={slide.id}>
										<SlideView
											slide={slide}
											onEdit={
												editingId === null ? () => startEdit(slide.id) : undefined
											}
										>
											{editingId === slide.id ? (
												<SlideEditor
													slide={slide}
													saving={updateSlide.isPending}
													onSave={(title, content) =>
														saveEdit(slide.id, title, content)
													}
													onCancel={() => setEditingId(null)}
												/>
											) : undefined}
										</SlideView>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-2 bg-background/80 backdrop-blur" />
							<CarouselNext className="right-2 bg-background/80 backdrop-blur" />
							<CarouselDots className="mt-4 md:hidden" />
						</Carousel>
					</div>
				</div>
			</div>

			{isFullscreen && (
				<FullscreenView
					slides={slides}
					index={selected}
					onNavigate={goTo}
					onClose={() => setIsFullscreen(false)}
				/>
			)}
		</>
	);
}
