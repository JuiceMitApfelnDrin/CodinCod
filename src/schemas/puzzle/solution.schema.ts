import { z } from "zod";
import { LanguageLabelEnum } from "../../config/languages.js";

export const solutionSchema = z.object({
	code: z.string().default(""),
	language: LanguageLabelEnum,
	languageVersion: z.string()
});
