import { onBoardUser } from "@/features/auth/actions";
import { DashboardView } from "@/features/decks/components/dashboard-view";

export default async function DashboardPage() {
	await onBoardUser();

	return <DashboardView />;
}
