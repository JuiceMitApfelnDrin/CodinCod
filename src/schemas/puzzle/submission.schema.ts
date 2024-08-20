import { z } from "zod";
import { SubmissionResultEnum } from "../../enums/submission-result-enum.js";

export const submissionSchema = z.object({
	code: z.string(),
	language: z.string(),
	createdAt: z.date().default(() => new Date()),
	puzzleId: z.string(),
	result: z.enum([
		SubmissionResultEnum.ERROR,
		SubmissionResultEnum.SUCCESS,
		SubmissionResultEnum.UNKNOWN
	]),
	userId: z.string()
});
