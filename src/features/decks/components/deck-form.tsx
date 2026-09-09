"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDeck } from "@/features/decks/hooks/use-decks";

const MIN_IDEA_LENGTH = 20;

export function DeckForm() {
	const [value, setValue] = React.useState("");
	const createDeck = useCreateDeck();

	const length = value.trim().length;
	const isValid = length >= MIN_IDEA_LENGTH && length <= 2000;
	const isPending = createDeck.isPending;

	function submit() {
		if (!isValid || isPending) return;
		createDeck.mutate(value);
	}

	return (
		<form
			className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-3"
			onSubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<Textarea
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
						event.preventDefault();
						submit();
					}
				}}
				placeholder="Describe your project idea…"
				aria-label="Project idea"
				className="min-h-32 rounded-2xl border-input px-4 py-3 text-base focus-visible:border-brand focus-visible:ring-brand/20 md:text-base"
			/>
			<div className="flex items-center justify-between gap-4">
				<p
					className={`font-mono text-xs ${
						isValid
							? "text-muted-foreground"
							: length === 0
								? "text-muted-foreground"
								: "text-destructive"
					}`}
				>
					{length < MIN_IDEA_LENGTH
						? `At least ${MIN_IDEA_LENGTH} characters.`
						: `${length} characters`}
				</p>
				<Button
					type="submit"
					disabled={!isValid || isPending}
					className="rounded-full bg-brand px-5 text-[#0a0a0a] hover:bg-brand-deep"
				>
					{isPending && <Loader2Icon className="animate-spin" aria-hidden />}
					Generate deck
				</Button>
			</div>
		</form>
	);
}
