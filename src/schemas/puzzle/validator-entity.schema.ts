import { z } from "zod";

export const validatorEntitySchema = z.object({
	input: z.string(),
	output: z.string(),
	puzzleId: z.string(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});
export type ValidatorEntity = z.infer<typeof validatorEntitySchema>;