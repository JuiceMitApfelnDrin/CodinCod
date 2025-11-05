import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const gameSubmissionParamsSchema = z
	.object({
		gameId: objectIdSchema,
		submissionId: objectIdSchema,
		userId: objectIdSchema,
	})
	.required();

export type GameSubmissionParams = z.infer<typeof gameSubmissionParamsSchema>;
