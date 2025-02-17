import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

export const validatorEntitySchema = z.object({
	input: z.string().transform((s) => s.trimEnd()),
	output: z.string().transform((s) => s.trimEnd()),
	createdAt: acceptedDateSchema,
	updatedAt: acceptedDateSchema
});
export type ValidatorEntity = z.infer<typeof validatorEntitySchema>;
