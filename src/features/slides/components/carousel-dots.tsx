"use client";

import * as React from "react";
import { useCarousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function CarouselDots({ className }: { className?: string }) {
	const { api } = useCarousel();

	const snapshot = React.useSyncExternalStore(
		React.useCallback(
			(onStoreChange) => {
				if (!api) return () => {};
				const onSelect = () => onStoreChange();
				api.on("select", onSelect);
				api.on("reInit", onSelect);
				return () => {
					api.off("select", onSelect);
					api.off("reInit", onSelect);
				};
			},
			[api],
		),
		() => (api ? `${api.selectedScrollSnap()}:${api.scrollSnapList().length}` : "0:0"),
		() => "0:0",
	);

	const [selected, count] = snapshot.split(":").map(Number);

	if (count < 2) return null;

	return (
		<div className={cn("flex items-center justify-center gap-1.5", className)}>
			{Array.from({ length: count }).map((_, index) => (
				<button
					key={index}
					aria-label={`Go to slide ${index + 1}`}
					aria-current={index === selected}
					onClick={() => api?.scrollTo(index)}
					className={cn(
						"size-2 rounded-full transition-colors",
						index === selected
							? "bg-foreground"
							: "bg-border hover:bg-muted-foreground/40",
					)}
				/>
			))}
		</div>
	);
}
