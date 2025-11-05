import { z } from "zod";
import { submissionDtoSchema } from "../../submission/schema/submission-dto.schema.js";

/**
 * Extended submission schema specifically for game submissions.
 * Includes computed fields like codeLength that are added by the backend.
 */
export const gameSubmissionSchema = submissionDtoSchema.extend({
	codeLength: z.number().int().nonnegative().optional(),
	timeSpent: z.number().nonnegative().optional(), // Time spent in seconds
});

export type GameSubmission = z.infer<typeof gameSubmissionSchema>;

export function isGameSubmission(data: unknown): data is GameSubmission {
	return gameSubmissionSchema.safeParse(data).success;
}
