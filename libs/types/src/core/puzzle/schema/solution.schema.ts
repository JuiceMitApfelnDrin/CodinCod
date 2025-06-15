import { z } from "zod";
import { puzzleLanguage, puzzleLanguageVersion } from "./puzzle-language.js";

export const solutionSchema = z.object({
	code: z.string().default(""),
	language: puzzleLanguage,
	languageVersion: puzzleLanguageVersion,
});
export type Solution = z.infer<typeof solutionSchema>;
