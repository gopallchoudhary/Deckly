"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
	Loader2Icon,
	MoreHorizontalIcon,
	PencilIcon,
	Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeckStatusChip } from "@/features/decks/components/deck-status-chip";
import {
	useDeleteDeck,
	useRenameDeck,
	useRetryDeck,
} from "@/features/decks/hooks/use-decks";
import type { DeckSummary } from "@/features/decks/actions";

export function DeckCard({ deck }: { deck: DeckSummary }) {
	const [isEditing, setIsEditing] = React.useState(false);
	const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
	const [draftTitle, setDraftTitle] = React.useState(deck.title ?? "");
	const commitGuardRef = React.useRef<"idle" | "committing" | "cancelled">(
		"idle",
	);

	const renameDeck = useRenameDeck();
	const deleteDeck = useDeleteDeck();
	const retryDeck = useRetryDeck();

	const displayTitle = deck.title ?? "Untitled deck";
	const isFailed = deck.status === "FAILED";

	function startEditing() {
		setDraftTitle(deck.title ?? "");
		commitGuardRef.current = "idle";
		setIsEditing(true);
	}

	function cancelRename() {
		commitGuardRef.current = "cancelled";
		setIsEditing(false);
	}

	function commitRename() {
		if (commitGuardRef.current !== "idle") return;
		commitGuardRef.current = "committing";

		const trimmed = draftTitle.trim();
		setIsEditing(false);
		if (!trimmed || trimmed === (deck.title ?? "")) return;
		renameDeck.mutate({ deckId: deck.id, title: trimmed });
	}

	return (
		<div className="group relative overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/25">
			{!isEditing && (
				<Link
					href={`/deck/${deck.id}`}
					className="absolute inset-0 z-0"
					aria-label={`Open ${displayTitle}`}
				/>
			)}

			<div className="pointer-events-none relative z-10 flex min-h-44 flex-col p-5 select-none">
				{isEditing ? (
					<form
						className="pointer-events-auto"
						onSubmit={(event) => {
							event.preventDefault();
							commitRename();
						}}
					>
						<input
							value={draftTitle}
							onChange={(event) => setDraftTitle(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Escape") cancelRename();
							}}
							onBlur={commitRename}
							autoFocus
							maxLength={100}
							aria-label="Deck title"
							className="w-full rounded-md border border-input bg-background px-2 py-1 text-xl font-semibold tracking-tight outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20"
						/>
					</form>
				) : (
					<h3 className="line-clamp-2 text-2xl font-semibold leading-snug tracking-tight">
						{displayTitle}
					</h3>
				)}

				<div className="mt-auto space-y-2 pt-6">
					<DeckStatusChip status={deck.status} />
					<p className="font-mono text-xs text-muted-foreground">
						{deck.slideCount} {deck.slideCount === 1 ? "slide" : "slides"} ·{" "}
						{format(new Date(deck.createdAt), "MMM d, yyyy")}
					</p>
					{isFailed && deck.errorMessage && (
						<p className="line-clamp-2 text-xs text-destructive">
							{deck.errorMessage}
						</p>
					)}
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger
					aria-label="Deck options"
					className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full border bg-background text-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:opacity-100 data-[popup-open]:bg-muted"
				>
					<MoreHorizontalIcon className="size-4" aria-hidden />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={startEditing}>
						<PencilIcon aria-hidden />
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem variant="destructive" onClick={() => setIsConfirmingDelete(true)}>
						<Trash2Icon aria-hidden />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{isFailed && (
				<Button
					size="xs"
					variant="outline"
					disabled={retryDeck.isPending}
					onClick={(event) => {
						event.preventDefault();
						retryDeck.mutate(deck.id);
					}}
					className="pointer-events-auto absolute right-3 bottom-3 z-10 rounded-full"
				>
					{retryDeck.isPending ? (
						<Loader2Icon className="animate-spin" aria-hidden />
					) : null}
					Retry
				</Button>
			)}

			<AlertDialog
				open={isConfirmingDelete}
				onOpenChange={setIsConfirmingDelete}
			>
				<AlertDialogContent size="sm">
					<AlertDialogHeader>
						<AlertDialogTitle>Delete deck?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes “{displayTitle}” and its{" "}
							{deck.slideCount} {deck.slideCount === 1 ? "slide" : "slides"}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								setIsConfirmingDelete(false);
								deleteDeck.mutate(deck.id);
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
