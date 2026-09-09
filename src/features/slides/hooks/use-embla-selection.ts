"use client";

import * as React from "react";
import type { CarouselApi } from "@/components/ui/carousel";

export function useEmblaSelection(
	api: CarouselApi | undefined,
	onChange?: (index: number) => void,
) {
	const onChangeRef = React.useRef(onChange);

	React.useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	const snapshot = React.useSyncExternalStore(
		React.useCallback(
			(onStoreChange) => {
				if (!api) return () => {};
				const onSelect = () => {
					onChangeRef.current?.(api.selectedScrollSnap());
					onStoreChange();
				};
				api.on("select", onSelect);
				api.on("reInit", onSelect);
				return () => {
					api.off("select", onSelect);
					api.off("reInit", onSelect);
				};
			},
			[api],
		),
		() =>
			api
				? `${api.selectedScrollSnap()}:${api.scrollSnapList().length}`
				: "0:0",
		() => "0:0",
	);

	const [selected, count] = snapshot.split(":").map(Number);
	return { selected, count };
}
