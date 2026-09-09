"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { DeckStatusChip } from "@/features/decks/components/deck-status-chip";
import { DeckStatusBanner } from "@/features/slides/components/deck-status-banner";
import { SlideView } from "@/features/slides/components/slide-view";
import { CarouselDots } from "@/features/slides/components/carousel-dots";
import { useDeck } from "@/features/decks/hooks/use-decks";
import type { DeckDetail } from "@/features/decks/actions";

export function DeckViewer({ initial }: { initial: DeckDetail }) {
	const { data } = useDeck(initial.id, initial);
	const deck = data ?? initial;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon-sm"
					render={<Link href="/dashboard" />}
					aria-label="Back to dashboard"
				>
					<ArrowLeftIcon aria-hidden />
				</Button>
				<div className="min-w-0">
					<h1 className="truncate text-lg font-semibold tracking-tight">
						{deck.title ?? "Untitled deck"}
					</h1>
				</div>
				<DeckStatusChip status={deck.status} className="ml-auto shrink-0" />
			</div>

			<DeckStatusBanner
				deckId={deck.id}
				status={deck.status}
				errorMessage={deck.errorMessage}
			/>

			{deck.status === "COMPLETE" && deck.slides.length > 0 && (
				<Carousel
					opts={{ loop: false, align: "start" }}
					className="mx-auto w-full max-w-3xl"
				>
					<CarouselContent>
						{deck.slides.map((slide) => (
							<CarouselItem key={slide.id}>
								<SlideView slide={slide} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="left-2 bg-background/80 backdrop-blur" />
					<CarouselNext className="right-2 bg-background/80 backdrop-blur" />
					<CarouselDots className="mt-4" />
				</Carousel>
			)}

			{deck.status === "COMPLETE" && deck.slides.length === 0 && (
				<p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
					This deck has no slides yet.
				</p>
			)}
		</div>
	);
}
