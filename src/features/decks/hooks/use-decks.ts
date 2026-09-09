"use client";

import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	createDeck,
	deleteDeck,
	getDeck,
	listDecks,
	renameDeck,
	retryDeck,
	type DeckDetail,
	type DeckSummary,
} from "@/features/decks/actions";

const ACTIVE_STATUSES = new Set(["PENDING", "GENERATING"]);

export const deckKeys = {
	all: ["decks"] as const,
	list: () => [...deckKeys.all, "list"] as const,
	detail: (deckId: string) => [...deckKeys.all, "detail", deckId] as const,
};

type ServerActionError = { message: string };

function toErrorMessage(error: unknown): string {
	const typed = error as ServerActionError | null;
	return typed?.message ?? "Something went wrong. Try again.";
}

export function useDecks() {
	return useQuery({
		queryKey: deckKeys.list(),
		queryFn: listDecks,
		refetchInterval: (query) => {
			const decks = query.state.data;
			return decks?.some((deck) => ACTIVE_STATUSES.has(deck.status))
				? 2500
				: false;
		},
	});
}

export function useDeck(deckId: string, initialData?: DeckDetail) {
	return useQuery({
		queryKey: deckKeys.detail(deckId),
		queryFn: () => getDeck(deckId),
		initialData,
		refetchInterval: (query) => {
			const deck = query.state.data;
			return deck && ACTIVE_STATUSES.has(deck.status) ? 2000 : false;
		},
	});
}

export function useCreateDeck() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: createDeck,
		onSuccess: async ({ id }) => {
			toast.success("Deck queued — generating your slides.");
			await queryClient.invalidateQueries({ queryKey: deckKeys.all });
			router.push(`/deck/${id}`);
		},
		onError: (error) => toast.error(toErrorMessage(error)),
	});
}

export function useRenameDeck() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deckId, title }: { deckId: string; title: string }) =>
			renameDeck(deckId, title),
		onMutate: async ({ deckId, title }) => {
			await queryClient.cancelQueries({ queryKey: deckKeys.list() });
			const previous = queryClient.getQueryData<DeckSummary[]>(deckKeys.list());
			queryClient.setQueryData<DeckSummary[]>(deckKeys.list(), (old) =>
				old?.map((deck) => (deck.id === deckId ? { ...deck, title } : deck)),
			);
			return { previous };
		},
		onError: (error, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(deckKeys.list(), context.previous);
			}
			toast.error(toErrorMessage(error));
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: deckKeys.all }),
	});
}

export function useDeleteDeck() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deckId: string) => deleteDeck(deckId),
		onMutate: async (deckId) => {
			await queryClient.cancelQueries({ queryKey: deckKeys.list() });
			const previous = queryClient.getQueryData<DeckSummary[]>(deckKeys.list());
			queryClient.setQueryData<DeckSummary[]>(deckKeys.list(), (old) =>
				old?.filter((deck) => deck.id !== deckId),
			);
			return { previous };
		},
		onError: (error, _deckId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(deckKeys.list(), context.previous);
			}
			toast.error(toErrorMessage(error));
		},
		onSuccess: () => toast.success("Deck deleted."),
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: deckKeys.all }),
	});
}

export function useRetryDeck() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deckId: string) => retryDeck(deckId),
		onMutate: async (deckId) => {
			await queryClient.cancelQueries({ queryKey: deckKeys.all });
			const previousList = queryClient.getQueryData<DeckSummary[]>(deckKeys.list());
			const previousDetail = queryClient.getQueryData<DeckDetail>(
				deckKeys.detail(deckId),
			);
			queryClient.setQueryData<DeckSummary[]>(deckKeys.list(), (old) =>
				old?.map((deck) =>
					deck.id === deckId
						? { ...deck, status: "PENDING", errorMessage: null }
						: deck,
				),
			);
			queryClient.setQueryData<DeckDetail>(deckKeys.detail(deckId), (old) =>
				old ? { ...old, status: "PENDING", errorMessage: null } : old,
			);
			return { previousList, previousDetail };
		},
		onError: (error, _deckId, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(deckKeys.list(), context.previousList);
			}
			toast.error(toErrorMessage(error));
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: deckKeys.all }),
	});
}
