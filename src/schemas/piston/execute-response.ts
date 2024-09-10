import { z } from "zod";
import { puzzleResultSchema } from "./puzzle-result.js";

export const pistonExecuteResponseSchema = z.object({
	language: z.string(),
	version: z.string(),
	run: z.object({
		signal: z.string().optional(),
		output: z.string(),
		stderr: z.string(),
		stdout: z.string(),
		code: z.number().optional(),
		result: puzzleResultSchema.optional()
	}),
	compile: z
		.object({
			signal: z.string().optional(),
			output: z.string(),
			stderr: z.string(),
			stdout: z.string(),
			code: z.number().optional()
			// result: puzzleResultSchema.optional()
		})
		.optional()
});
export type PistonExecuteResponse = z.infer<typeof pistonExecuteResponseSchema>;
