import { z } from "zod";
import { pistonExecutionRequestSchema } from "../../../piston/schema/request.js";
import { codeExecutionResponseSchema } from "../../../piston/schema/code-execution-response.js";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";

/**
 * POST /execute - Execute code without saving submission
 * Used for testing code before final submission
 */
export const executeCodeRequestSchema = z.object({
	code: z.string().min(1, "Code cannot be empty"),
	language: z.string().min(1, "Language is required"),
	testInput: z.string().default(""),
	testOutput: z.string().default(""),
});

export const executeCodeResponseSchema =
	codeExecutionResponseSchema.or(errorResponseSchema);

export type ExecuteCodeRequest = z.infer<typeof executeCodeRequestSchema>;
export type ExecuteCodeResponse = z.infer<typeof executeCodeResponseSchema>;
