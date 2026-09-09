import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
			<main className="flex max-w-2xl flex-col items-center gap-6 text-center">
				<span className="font-mono text-[11px] font-semibold tracking-[0.5px] uppercase text-muted-foreground">
					Deckly
				</span>
				<h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					Turn a prompt into a pitch deck.
				</h1>
				<p className="text-base text-balance text-muted-foreground">
					Describe your project idea and get investor-ready slides — written
					by AI, illustrated automatically.
				</p>
				<div className="mt-2 flex items-center gap-3">
					<Button
						variant="outline"
						className="rounded-full"
						render={<Link href="/sign-in" />}
					>
						Sign in
					</Button>
					<Button
						className="rounded-full bg-brand text-[#0a0a0a] hover:bg-brand-deep"
						render={<Link href="/sign-up" />}
					>
						Sign up
					</Button>
				</div>
			</main>
		</div>
	);
}
