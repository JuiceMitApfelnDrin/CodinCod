import { z } from "zod";
import { SubmissionResultEnum } from "../../enums/submission-result-enum.js";
import { LanguageLabelEnum } from "../../config/languages.js";

export const submissionSchema = z.object({
	code: z.string(),
	language: LanguageLabelEnum,
	languageVersion: z.string(),
	createdAt: z.date().default(() => new Date()),
	puzzleId: z.string(),
	result: z.enum([
		SubmissionResultEnum.ERROR,
		SubmissionResultEnum.SUCCESS,
		SubmissionResultEnum.UNKNOWN
	]),
	userId: z.string()
});
