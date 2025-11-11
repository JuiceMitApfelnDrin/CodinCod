import type { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { submissionEntitySchema } from "./submission-entity.schema.js";

const baseSubmissionDtoSchema = submissionEntitySchema;

export const submissionDtoSchema = baseSubmissionDtoSchema.extend({
	_id: objectIdSchema
});

export type SubmissionDto = z.infer<typeof submissionDtoSchema>;

export function isSubmissionDto(data: unknown): data is SubmissionDto {
	return submissionDtoSchema.safeParse(data).success;
}
