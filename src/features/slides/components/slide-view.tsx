"use client";

import * as React from "react";
import Image from "next/image";
import { PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export function SlideView({
	slide,
	onEdit,
	children,
	className,
}: {
	slide: SlideItem;
	onEdit?: () => void;
	children?: React.ReactNode;
	className?: string;
}) {
	const bullets = toBullets(slide.content);
	const isEditing = React.Children.count(children) > 0;

	return (
		<div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
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
				{isEditing ? (
					<div className="max-w-3xl">{children}</div>
				) : (
					<div className="flex max-w-3xl items-start justify-between gap-3">
						<div className="min-w-0">
							<h3 className="text-xl font-semibold tracking-tight">
								{slide.title}
							</h3>
							<ul className="mt-3 space-y-2">
								{bullets.map((bullet, index) => (
									<li
										key={index}
										className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
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
						{onEdit && (
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={onEdit}
								aria-label="Edit slide"
								className="shrink-0 rounded-full"
							>
								<PencilIcon aria-hidden />
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
