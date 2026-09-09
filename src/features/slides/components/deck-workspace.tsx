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
			<div className="flex min-h-0 flex-1 flex-col rounded-4xl border bg-muted p-4 sm:p-6">
				<div className="flex min-h-0 flex-1 gap-4">
					<SlideRail
						slides={slides}
						selected={selected}
						onSelect={goTo}
						collapsed={collapsed}
						onToggleCollapsed={() => setCollapsed((value) => !value)}
					/>
					<div className="hidden w-px shrink-0 bg-border md:block" aria-hidden />

					<div className="flex min-h-0 min-w-0 flex-1 flex-col">
						<div className="mb-4 flex shrink-0 items-center justify-between gap-3">
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

						<div className="min-h-0 flex-1 overflow-y-auto">
							<Carousel
								setApi={setApi}
								opts={{ loop: false, align: "start" }}
								className="w-full min-w-0"
							>
								<div className="mx-auto flex w-full items-center justify-center gap-3 md:max-w-[calc((100dvh-480px)*16/9+88px)]">
									<CarouselPrevious className="static left-auto shrink-0 bg-background/80 backdrop-blur" />
									<CarouselContent className="min-w-0 flex-1">
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
									<CarouselNext className="static right-auto shrink-0 bg-background/80 backdrop-blur" />
								</div>
								<CarouselDots className="mt-4 md:hidden" />
							</Carousel>
						</div>
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
