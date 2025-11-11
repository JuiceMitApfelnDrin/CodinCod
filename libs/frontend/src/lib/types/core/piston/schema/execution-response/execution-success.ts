import { z } from "zod";
import {
	puzzleLanguage,
	puzzleLanguageVersion
} from "../../../puzzle/schema/puzzle-language.js";
import { codeCompilationSchema } from "./code-compilation.schema.js";
import { codeRunSchema } from "./code-run.schema.js";

export const pistonExecutionResponseSuccessSchema = z.object({
	language: puzzleLanguage,
	version: puzzleLanguageVersion,
	run: codeRunSchema,
	compile: codeCompilationSchema.optional()
});
export type PistonExecutionResponseSuccess = z.infer<
	typeof pistonExecutionResponseSuccessSchema
>;
export function isPistonExecutionResponseSuccess(
	supposedExecutionSuccess: unknown
): supposedExecutionSuccess is PistonExecutionResponseSuccess {
	return pistonExecutionResponseSuccessSchema.safeParse(
		supposedExecutionSuccess
	).success;
}
