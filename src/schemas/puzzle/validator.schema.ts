import { z } from "zod";
import { pistonExecuteResponseSchema } from "../piston/execute-response.js";

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
	testResult: pistonExecuteResponseSchema.pick({ compile: true, run: true }).optional()
});
export type ValidatorEntity = z.infer<typeof validatorEntitySchema>;
