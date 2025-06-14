import { z } from "zod";
import { submissionEntitySchema } from "../schema/submission-entity.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const codeSubmissionParamsSchema = submissionEntitySchema
	.pick({
		code: true,
		language: true,
	})
	.extend({
		userId: objectIdSchema,
		puzzleId: objectIdSchema,
	})
	.required();

export type CodeSubmissionParams = z.infer<typeof codeSubmissionParamsSchema>;
