import { z } from "zod";
import { pistonExecutionResponseSuccessSchema } from "../../piston/index.js";

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
		.optional(),
	testResult: pistonExecutionResponseSuccessSchema.pick({ compile: true, run: true }).optional()
});
export type ValidatorEntity = z.infer<typeof validatorEntitySchema>;
