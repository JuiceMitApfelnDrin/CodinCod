import type { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { submissionEntitySchema } from "../schema/submission-entity.schema.js";

export const codeSubmissionParamsSchema = submissionEntitySchema
	.pick({
		code: true,
		programmingLanguage: true
	})
	.extend({
		userId: objectIdSchema,
		puzzleId: objectIdSchema
	})
	.required();

export type CodeSubmissionParams = z.infer<typeof codeSubmissionParamsSchema>;
