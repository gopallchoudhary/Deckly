import type { ReactNode } from "react";
import { AppHeader } from "@/features/decks/components/app-header";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-background">
			<AppHeader />
			<main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
				{children}
			</main>
		</div>
	);
}
