import { z } from "zod";
import { submissionEntitySchema } from "../../submission/schema/submission-entity.schema.js";

// Submit code request - includes puzzle ID, code, language
export const submitCodeRequestSchema = z.object({
	puzzleId: z.string(),
	code: z.string(),
	language: z.string()
});
export type SubmitCodeRequest = z.infer<typeof submitCodeRequestSchema>;

// Submit code response - returns submission details
export const submitCodeResponseSchema = submissionEntitySchema;
export type SubmitCodeResponse = z.infer<typeof submitCodeResponseSchema>;
