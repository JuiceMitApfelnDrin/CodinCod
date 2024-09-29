import { z } from "zod";
import { puzzleResultSchema } from "../piston/puzzle-result.js";
import { acceptedDateSchema } from "../date/accepted-date.js";

export const submissionEntitySchema = z.object({
	code: z.string(),
	language: z.string(),
	languageVersion: z.string(),
	createdAt: acceptedDateSchema.default(() => new Date()),
	puzzleId: z.string(),
	result: puzzleResultSchema,
	userId: z.string()
});
export type SubmissionEntity = z.infer<typeof submissionEntitySchema>;
