"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SlideItem } from "@/features/slides/components/slide-view";

const MAX_TITLE = 120;
const MAX_CONTENT = 2000;

export function SlideEditor({
	slide,
	saving = false,
	onSave,
	onCancel,
}: {
	slide: SlideItem;
	saving?: boolean;
	onSave: (title: string, content: string) => void;
	onCancel: () => void;
}) {
	const [title, setTitle] = React.useState(slide.title);
	const [content, setContent] = React.useState(slide.content);

	const trimmedTitle = title.trim();
	const trimmedContent = content.trim();
	const isValid =
		trimmedTitle.length > 0 &&
		trimmedTitle.length <= MAX_TITLE &&
		trimmedContent.length > 0 &&
		trimmedContent.length <= MAX_CONTENT;

	return (
		<div className="space-y-3">
			<Input
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Escape") onCancel();
				}}
				maxLength={MAX_TITLE + 1}
				aria-label="Slide title"
				className="h-auto rounded-md bg-background px-2.5 py-1.5 text-base font-semibold dark:bg-input/30"
			/>
			<Textarea
				value={content}
				onChange={(event) => setContent(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Escape") onCancel();
				}}
				maxLength={MAX_CONTENT + 1}
				aria-label="Slide content"
				className="min-h-28 rounded-md bg-background text-sm dark:bg-input/30"
			/>
			<div className="flex items-center justify-between gap-3">
				<p
					className={`font-mono text-xs ${
						isValid ? "text-muted-foreground" : "text-destructive"
					}`}
				>
					{trimmedContent.length === 0
						? "Content cannot be empty."
						: `${trimmedContent.length} characters`}
				</p>
				<div className="flex shrink-0 items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={onCancel}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						className="rounded-full"
						disabled={!isValid || saving}
						onClick={() => onSave(trimmedTitle, trimmedContent)}
					>
						{saving && <Loader2Icon className="animate-spin" aria-hidden />}
						Save
					</Button>
				</div>
			</div>
		</div>
	);
}
