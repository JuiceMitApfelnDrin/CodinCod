import { z } from "zod";

export const approvePuzzleSchema = z.object({});
export type ApprovePuzzle = z.infer<typeof approvePuzzleSchema>;

export const revisePuzzleSchema = z.object({
	reason: z
		.string()
		.min(10, "Reason must be at least 10 characters")
		.max(500, "Reason must be less than 500 characters")
});
export type RevisePuzzle = z.infer<typeof revisePuzzleSchema>;
