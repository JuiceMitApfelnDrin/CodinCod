import { z } from "zod";
import { codeExecutionSuccessResponseSchema } from "../../core/piston/schema/code-execution-response.js";

export const executeCodeRequestSchema = z.object({
	code: z.string(),
	language: z.string(),
	testInput: z.string(),
	testOutput: z.string(),
});

export const executeCodeSuccessResponseSchema =
	codeExecutionSuccessResponseSchema;

export const executeErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

export type ExecuteCodeRequest = z.infer<typeof executeCodeRequestSchema>;

export type ExecuteCodeSuccessResponse = z.infer<
	typeof executeCodeSuccessResponseSchema
>;
export type ExecuteErrorResponse = z.infer<typeof executeErrorResponseSchema>;
