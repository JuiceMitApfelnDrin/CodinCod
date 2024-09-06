import { z } from "zod";
import { submissionResultSchema } from "./submission-result.js";

export const submissionEntitySchema = z.object({
	code: z.string(),
	language: z.string(),
	languageVersion: z.string(),
	createdAt: z.date().default(() => new Date()),
	puzzleId: z.string(),
	result: submissionResultSchema,
	userId: z.string()
});
export type SubmissionEntity = z.infer<typeof submissionEntitySchema>;
