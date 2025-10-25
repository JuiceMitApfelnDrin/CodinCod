import { z } from "zod";

/**
 * Request to approve a puzzle
 */
export const approvePuzzleSchema = z.object({
	// Can be extended later with feedback/notes
});
export type ApprovePuzzle = z.infer<typeof approvePuzzleSchema>;

/**
 * Request to request revisions on a puzzle
 */
export const revisePuzzleSchema = z.object({
	// Can be extended later with feedback/notes
	reason: z.string().optional(),
});
export type RevisePuzzle = z.infer<typeof revisePuzzleSchema>;
