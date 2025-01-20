import { z } from "zod";
import { puzzleResultSchema } from "../../piston/schema/puzzle-result.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

export const submissionEntitySchema = z.object({
	code: z.string().optional(),
	language: z.string(),
	languageVersion: z.string(),
	createdAt: acceptedDateSchema.default(() => new Date()),
	puzzleId: z.string(),
	result: puzzleResultSchema,
	userId: z.string()
});
export type SubmissionEntity = z.infer<typeof submissionEntitySchema>;
