import { z } from "zod";
import { DEFAULT_LANGUAGE, LanguageLabelEnum, languageLabels } from "../../config/languages.js";

export const solutionSchema = z.object({
	code: z.string().default(""),
	language: LanguageLabelEnum,
	languageVersion: z.string()
});
