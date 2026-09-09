"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type SlideItem = {
	id: string;
	order: number;
	title: string;
	content: string;
	imageUrl: string | null;
};

function toBullets(content: string): string[] {
	return content
		.split("\n")
		.map((line) => line.trim().replace(/^•\s*/, ""))
		.filter(Boolean);
}

export function SlideView({ slide }: { slide: SlideItem }) {
	const bullets = toBullets(slide.content);

	return (
		<div className="overflow-hidden rounded-lg border bg-card">
			<div className="relative aspect-video w-full bg-muted">
				{slide.imageUrl ? (
					<Image
						src={slide.imageUrl}
						alt={slide.title}
						fill
						sizes="(max-width: 1024px) 100vw, 896px"
						className="object-cover"
						priority={slide.order === 1}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background">
						<span className="font-mono text-5xl font-semibold text-muted-foreground/40">
							{String(slide.order).padStart(2, "0")}
						</span>
					</div>
				)}
			</div>
			<div className="p-6">
				<h3 className="text-xl font-semibold tracking-tight">{slide.title}</h3>
				<ul className="mt-3 space-y-2">
					{bullets.map((bullet, index) => (
						<li
							key={index}
							className={cn("flex gap-2.5 text-sm leading-relaxed text-muted-foreground")}
						>
							<span
								aria-hidden
								className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand"
							/>
							{bullet}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
