import { z } from "zod";

export const pistonExecuteResponseSchema = z.object({
	language: z.string(),
	version: z.string(),
	run: z.object({
		signal: z.string().optional(),
		output: z.string(),
		stderr: z.string(),
		stdout: z.string(),
		code: z.number().optional()
	}),
	compile: z
		.object({
			signal: z.string().optional(),
			output: z.string(),
			stderr: z.string(),
			stdout: z.string(),
			code: z.number().optional()
		})
		.optional()
});
export type PistonExecuteResponse = z.infer<typeof pistonExecuteResponseSchema>;
