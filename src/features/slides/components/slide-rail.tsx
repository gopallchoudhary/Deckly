"use client";

import Image from "next/image";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SlideItem } from "@/features/slides/components/slide-view";

export function SlideRail({
	slides,
	selected,
	onSelect,
	collapsed,
	onToggleCollapsed,
}: {
	slides: SlideItem[];
	selected: number;
	onSelect: (index: number) => void;
	collapsed: boolean;
	onToggleCollapsed: () => void;
}) {
	if (collapsed) {
		return (
			<nav
				aria-label="Slides"
				className="hidden w-12 shrink-0 flex-col items-center gap-1 md:flex"
			>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onToggleCollapsed}
					aria-label="Expand slide panel"
					className="shrink-0"
				>
					<PanelLeftOpenIcon aria-hidden />
				</Button>
				{slides.map((slide, index) => (
					<button
						key={slide.id}
						onClick={() => onSelect(index)}
						aria-label={`Go to slide ${index + 1}: ${slide.title}`}
						aria-current={index === selected}
						className={cn(
							"flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
							index === selected
								? "bg-background text-foreground"
								: "text-muted-foreground hover:bg-background/60",
						)}
					>
						{String(index + 1).padStart(2, "0")}
					</button>
				))}
			</nav>
		);
	}

	return (
		<nav aria-label="Slides" className="hidden w-60 shrink-0 flex-col gap-3 md:flex">
			<div className="flex items-center justify-between px-1">
				<span className="text-[11px] font-semibold tracking-[0.5px] uppercase text-muted-foreground">
					Slides
				</span>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onToggleCollapsed}
					aria-label="Collapse slide panel"
					className="shrink-0"
				>
					<PanelLeftCloseIcon aria-hidden />
				</Button>
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
				{slides.map((slide, index) => (
					<button
						key={slide.id}
						onClick={() => onSelect(index)}
						aria-label={`Go to slide ${index + 1}: ${slide.title}`}
						aria-current={index === selected}
						className={cn(
							"flex items-center gap-2.5 rounded-md border p-1.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
							index === selected
								? "border-foreground/30 bg-background"
								: "border-transparent hover:bg-background/60",
						)}
					>
						<span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-sm bg-background/80">
							{slide.imageUrl ? (
								<Image
									src={slide.imageUrl}
									alt=""
									fill
									sizes="80px"
									className="object-cover"
								/>
							) : (
								<span className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
									{String(index + 1).padStart(2, "0")}
								</span>
							)}
						</span>
						<span className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug">
							{slide.title}
						</span>
					</button>
				))}
			</div>
		</nav>
	);
}
