"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, Minimize2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideView } from "@/features/slides/components/slide-view";
import type { SlideItem } from "@/features/slides/components/slide-view";

export function FullscreenView({
	slides,
	index,
	onNavigate,
	onClose,
}: {
	slides: SlideItem[];
	index: number;
	onNavigate: (index: number) => void;
	onClose: () => void;
}) {
	const total = slides.length;
	const current = Math.min(Math.max(index, 0), total - 1);

	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "ArrowRight") {
				event.preventDefault();
				onNavigate(Math.min(current + 1, total - 1));
			} else if (event.key === "ArrowLeft") {
				event.preventDefault();
				onNavigate(Math.max(current - 1, 0));
			} else if (event.key === "Escape") {
				onClose();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [current, total, onNavigate, onClose]);

	React.useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Presentation mode"
			className="fixed inset-0 z-50 flex flex-col bg-background"
		>
			<div className="flex items-center justify-between p-4 sm:p-6">
				<span className="font-mono text-sm text-muted-foreground">
					{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
				</span>
				<Button
					variant="outline"
					size="icon"
					onClick={onClose}
					aria-label="Exit presentation mode"
					className="rounded-full"
				>
					<Minimize2Icon aria-hidden />
				</Button>
			</div>

			<div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 pb-2 sm:px-6">
				<div className="w-full max-w-3xl">
					<SlideView slide={slides[current]} />
				</div>
			</div>

			<div className="flex items-center justify-center gap-3 p-4 sm:p-6">
				<Button
					variant="outline"
					size="icon"
					disabled={current === 0}
					onClick={() => onNavigate(current - 1)}
					aria-label="Previous slide"
					className="rounded-full"
				>
					<ChevronLeftIcon aria-hidden />
				</Button>
				<Button
					variant="outline"
					size="icon"
					disabled={current === total - 1}
					onClick={() => onNavigate(current + 1)}
					aria-label="Next slide"
					className="rounded-full"
				>
					<ChevronRightIcon aria-hidden />
				</Button>
			</div>
		</div>
	);
}
