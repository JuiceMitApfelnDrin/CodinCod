import { z } from "zod";
import { pistonExecutionResponseSuccessSchema } from "../../piston/schema/execution-response/execution-success.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

export const validatorEntitySchema = z.object({
	input: z.string().transform((s) => s.trimEnd()),
	output: z.string().transform((s) => s.trimEnd()),
	createdAt: acceptedDateSchema,
	updatedAt: acceptedDateSchema,
	testResult: pistonExecutionResponseSuccessSchema
		.pick({ compile: true, run: true })
		.optional(),
});
export type ValidatorEntity = z.infer<typeof validatorEntitySchema>;
