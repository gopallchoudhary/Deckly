"use client";

import * as React from "react";
import {
	FileDownIcon,
	FileTextIcon,
	Loader2Icon,
	Maximize2Icon,
	PresentationIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
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
	const [isExporting, setIsExporting] = React.useState(false);
	const updateSlide = useUpdateSlide();

	async function exportDeck(format: "pptx" | "pdf") {
		setIsExporting(true);
		try {
			const response = await fetch(
				`/api/decks/${deck.id}/export?format=${format}`,
			);
			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(body?.error ?? "Export failed.");
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `${deck.title ?? "deck"}.${format}`;
			document.body.append(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
			toast.success(
				format === "pptx" ? "Exported as PowerPoint." : "Exported as PDF.",
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Export failed.",
			);
		} finally {
			setIsExporting(false);
		}
	}

	const { selected, count } = useEmblaSelection(api, () => setEditingId(null));
	const slides = deck.slides;

	const goTo = React.useCallback(
		(index: number) => {
			api?.scrollTo(index);
		},
		[api],
	);

	const handleStartEdit = React.useCallback(
		(slideId: string) => {
			if (slides[selected]?.id !== slideId) {
				goTo(slides.findIndex((slide) => slide.id === slideId));
			}
			setEditingId(slideId);
		},
		[slides, selected, goTo],
	);

	React.useEffect(() => {
		if (isFullscreen) return;

		function handleKeyDown(event: KeyboardEvent) {
			const key = event.key.toLowerCase();
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			if (target?.closest("[role=menu], [role=dialog]")) {
				return;
			}
			if (event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}

			if (key === "arrowright" || key === "arrowleft") {
				if (target?.closest("[data-slot=carousel]")) return;
				event.preventDefault();
				goTo(
					key === "arrowright"
						? Math.min(selected + 1, count - 1)
						: Math.max(selected - 1, 0),
				);
			} else if (key === "p") {
				event.preventDefault();
				setIsFullscreen(true);
			} else if (key === "e") {
				if (editingId !== null) return;
				const slide = slides[selected];
				if (!slide) return;
				event.preventDefault();
				handleStartEdit(slide.id);
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selected, count, goTo, isFullscreen, editingId, slides, handleStartEdit]);

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
							<div className="flex items-center gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant="outline"
												size="sm"
												className="rounded-full"
												disabled={isExporting}
											/>
										}
									>
										{isExporting ? (
											<Loader2Icon className="animate-spin" aria-hidden />
										) : (
											<FileDownIcon aria-hidden />
										)}
										Export
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => exportDeck("pptx")}>
											<PresentationIcon aria-hidden />
											PowerPoint (.pptx)
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => exportDeck("pdf")}>
											<FileTextIcon aria-hidden />
											PDF (.pdf)
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger
											render={
												<Button
													variant="outline"
													size="sm"
													className="rounded-full"
													onClick={() => setIsFullscreen(true)}
												/>
											}
										>
											<Maximize2Icon aria-hidden />
											Present
										</TooltipTrigger>
										<TooltipContent>
											Press <Kbd>P</Kbd> to present
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
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
													editingId === null
														? () => handleStartEdit(slide.id)
														: undefined
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
