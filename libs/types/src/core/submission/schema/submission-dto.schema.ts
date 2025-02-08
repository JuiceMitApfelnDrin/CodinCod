import { z } from "zod";
import { submissionEntitySchema } from "./submission-entity.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

const baseSubmissionDtoSchema = submissionEntitySchema;

export const submissionDtoSchema = baseSubmissionDtoSchema.extend({
	_id: objectIdSchema.optional()
});

export type SubmissionDto = z.infer<typeof submissionDtoSchema>;

export function isSubmissionDto(data: unknown): data is SubmissionDto {
	return submissionDtoSchema.safeParse(data).success;
}
