import { z } from "zod";
import { userDtoSchema } from "../../user/index.js";
import { submissionEntitySchema } from "./submission-entity.schema.js";

const baseSubmissionDtoSchema = submissionEntitySchema;

export const submissionDtoSchema = baseSubmissionDtoSchema.extend({
	_id: z.string().optional()
});

export type SubmissionDto = z.infer<typeof submissionDtoSchema>;

export function isSubmissionDto(data: unknown): data is SubmissionDto {
	return submissionDtoSchema.safeParse(data).success;
}
