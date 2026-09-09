import { onBoardUser } from "@/features/auth/actions";
import { AppHeader } from "@/features/decks/components/app-header";
import { DashboardView } from "@/features/decks/components/dashboard-view";

export default async function DashboardPage() {
	await onBoardUser();

	return (
		<div className="min-h-dvh bg-background">
			<AppHeader />
			<main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
				<DashboardView />
			</main>
		</div>
	);
}
