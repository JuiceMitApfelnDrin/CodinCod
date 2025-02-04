import { z } from "zod";
import { puzzleLanguage } from "./puzzle-language.js";

export const solutionSchema = z.object({
	code: z.string().default(""),
	language: puzzleLanguage,
	languageVersion: z.string()
});
