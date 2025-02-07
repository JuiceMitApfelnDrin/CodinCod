import { z } from "zod";
import { pistonExecutionResponseSuccessSchema } from "../../piston/schema/execution-response/execution-success.js";

export const validatorEntitySchema = z.object({
	input: z.string().transform(s => s.trimEnd()),
	output: z.string().transform(s => s.trimEnd()),
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
