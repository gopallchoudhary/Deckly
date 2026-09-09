import type { ReactNode } from "react";
import { AppHeader } from "@/features/decks/components/app-header";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-background">
			<AppHeader />
			<main className="w-full px-4 py-6 sm:px-6 sm:py-8">
				{children}
			</main>
		</div>
	);
}
