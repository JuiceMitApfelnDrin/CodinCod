import { z } from "zod";
import { SubmissionResultEnum } from "../../enums/submission-result-enum.js";

export const submissionResultSchema = z.enum([
	SubmissionResultEnum.ERROR,
	SubmissionResultEnum.SUCCESS,
	SubmissionResultEnum.UNKNOWN
]);
export type SubmissionResult = z.infer<typeof submissionResultSchema>;
