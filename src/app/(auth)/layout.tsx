import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
			<span className="mb-8 font-mono text-[11px] font-semibold tracking-[0.5px] uppercase text-muted-foreground">
				Deckly
			</span>
			{children}
		</div>
	);
}
