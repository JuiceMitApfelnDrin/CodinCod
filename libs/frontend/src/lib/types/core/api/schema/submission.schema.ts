import { z } from "zod";
import { submissionDtoSchema } from "../../submission/schema/submission-dto.schema.js";

// GET /submission/:id response
export const getSubmissionByIdResponseSchema = submissionDtoSchema;
export type GetSubmissionByIdResponse = z.infer<
	typeof getSubmissionByIdResponseSchema
>;

// POST /submission/game request
export const submitGameRequestSchema = z.object({
	gameId: z.string(),
	code: z.string(),
	language: z.string()
});
export type SubmitGameRequest = z.infer<typeof submitGameRequestSchema>;

// POST /submission/game response
export const submitGameResponseSchema = submissionDtoSchema;
export type SubmitGameResponse = z.infer<typeof submitGameResponseSchema>;
