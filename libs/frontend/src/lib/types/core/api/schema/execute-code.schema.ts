import { z } from "zod";
import { codeExecutionResponseSchema } from "../../piston/schema/code-execution-response.js";
import { pistonExecutionRequestSchema } from "../../piston/schema/request.js";

// Request schema for code execution
export const executeCodeRequestSchema = pistonExecutionRequestSchema;
export type ExecuteCodeRequest = z.infer<typeof executeCodeRequestSchema>;

// Response schema for code execution
export const executeCodeResponseSchema = codeExecutionResponseSchema;
export type ExecuteCodeResponse = z.infer<typeof executeCodeResponseSchema>;
