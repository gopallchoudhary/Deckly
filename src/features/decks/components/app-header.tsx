"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeModeToggle } from "@/components/ui/theme-mode-toggle";

export function AppHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
				<span className="text-sm font-semibold tracking-tight">Deckly</span>
				<div className="flex items-center gap-2">
					<ThemeModeToggle className="rounded-full" />
					<UserButton />
				</div>
			</div>
		</header>
	);
}
