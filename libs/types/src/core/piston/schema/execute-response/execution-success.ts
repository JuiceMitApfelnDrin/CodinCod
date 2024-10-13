import { z } from "zod";
import { puzzleResultSchema } from "../puzzle-result.js";

export const pistonExecutionResponseSuccessSchema = z.object({
	language: z.string(),
	version: z.string(),
	run: z.object({
		signal: z.string().or(z.null()),
		output: z.string(),
		stderr: z.string(),
		stdout: z.string(),
		code: z.number().or(z.null()),
		result: puzzleResultSchema.optional()
	}),
	compile: z
		.object({
			signal: z.string().or(z.null()),
			output: z.string(),
			stderr: z.string(),
			stdout: z.string(),
			code: z.number().or(z.null())
			// result: puzzleResultSchema.optional()
		})
		.optional()
});
export type PistonExecutionResponseSuccess = z.infer<typeof pistonExecutionResponseSuccessSchema>;
export function isPistonExecutionResponseSuccess(
	supposedExecutionSuccess: unknown
): supposedExecutionSuccess is PistonExecutionResponseSuccess {
	return pistonExecutionResponseSuccessSchema.safeParse(supposedExecutionSuccess).success;
}