import { z } from "zod";
import { puzzleResultSchema } from "../puzzle-result.js";

export const pistonExecuteResponseSuccessSchema = z.object({
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
export type PistonExecuteResponseSuccess = z.infer<typeof pistonExecuteResponseSuccessSchema>;
export function isPistonExecuteResponseSuccess(
	supposedExecutionSuccess: unknown
): supposedExecutionSuccess is PistonExecuteResponseSuccess {
	return pistonExecuteResponseSuccessSchema.safeParse(supposedExecutionSuccess).success;
}
