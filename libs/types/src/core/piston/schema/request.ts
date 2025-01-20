import { z } from "zod";
import { pistonFileSchema } from "./file-encoding.js";

export const pistonExecutionRequestSchema = z.object({
	language: z.string(),
	version: z.string(),
	files: z.array(pistonFileSchema),
	stdin: z.string().optional(),
	args: z.any().optional(),
	run_timeout: z.number().optional(), // in milliseconds
	compile_timeout: z.number().optional(), // in milliseconds for the run stage to finish before bailing out.Must be a number, less than or equal to the configured maximum timeout.Defaults to maximum.
	compile_memory_limit: z.number().optional(), // in bytes
	run_memory_limit: z.number().optional() // in bytes
});
export type PistonExecutionRequest = z.infer<typeof pistonExecutionRequestSchema>;
