import { z } from "zod";

export const validatorEntitySchema = z.object({
	input: z.string(),
	output: z.string(),
	createdAt: z
		.date()
		.default(() => new Date())
		.optional(),
	updatedAt: z
		.date()
		.default(() => new Date())
		.optional()
});
export type ValidatorEntity = z.infer<typeof validatorEntitySchema>;
