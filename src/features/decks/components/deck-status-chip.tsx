import { CheckIcon, CircleAlertIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeckStatusValue = "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";

const chipStyles: Record<DeckStatusValue, string> = {
	PENDING: "border-border text-muted-foreground",
	GENERATING: "border-brand/30 bg-brand/10 text-brand",
	COMPLETE: "border-brand/30 bg-brand/10 text-brand",
	FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function DeckStatusChip({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const value = (status in chipStyles ? status : "PENDING") as DeckStatusValue;

	return (
		<span
			className={cn(
				"inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.5px]",
				chipStyles[value],
				className,
			)}
		>
			{value === "GENERATING" && (
				<Loader2Icon className="size-3 animate-spin" aria-hidden />
			)}
			{value === "COMPLETE" && <CheckIcon className="size-3" aria-hidden />}
			{value === "FAILED" && (
				<CircleAlertIcon className="size-3" aria-hidden />
			)}
			{value}
		</span>
	);
}
