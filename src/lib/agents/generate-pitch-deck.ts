import {
	run,
	InputGuardrailTripwireTriggered,
	OutputGuardrailTripwireTriggered,
} from "@openai/agents";

import { pitchDeckAgent } from "@/lib/agents/pitch-deck-agent";
import { PitchDeckSchema, type PitchDeck } from "@/lib/schemas/pitch-deck";

/** Friendly error when a guardrail blocks generation. */
export class PitchDeckGenerationError extends Error {
	readonly reason?: string;

	constructor(message: string, reason?: string) {
		super(message);
		this.name = "PitchDeckGenerationError";
		this.reason = reason;
	}
}

function getGuardrailReason(error: unknown): string | undefined {
	if (error instanceof InputGuardrailTripwireTriggered) {
		const info = error.result.output.outputInfo as
			| { reason?: string }
			| undefined;
		return info?.reason;
	}

	if (error instanceof OutputGuardrailTripwireTriggered) {
		const info = error.result.output.outputInfo as
			| { reason?: string }
			| undefined;
		return info?.reason;
	}

	return undefined;
}

/**
 * Generate a pitch deck from a project idea.
 *
 * 1. Input guardrail checks the idea is long enough
 * 2. Agent generates structured JSON (PitchDeckSchema)
 * 3. Output guardrail checks content quality
 *
 * Throws PitchDeckGenerationError if a guardrail blocks the run.
 */
export async function generatePitchDeck(idea: string): Promise<PitchDeck> {
	try {
		const result = await run(pitchDeckAgent, idea.trim());

		// Parse again with Zod — guarantees the shape matches our schema.
		return PitchDeckSchema.parse(result.finalOutput as unknown);
	} catch (error) {
		if (
			error instanceof InputGuardrailTripwireTriggered ||
			error instanceof OutputGuardrailTripwireTriggered
		) {
			const reason =
				getGuardrailReason(error) ??
				"Pitch deck generation was blocked by a guardrail.";
			throw new PitchDeckGenerationError(reason, reason);
		}

		throw error;
	}
}
