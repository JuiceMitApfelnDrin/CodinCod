import { z } from "zod";
import { puzzleLanguage, puzzleLanguageVersion } from "../../puzzle/schema/puzzle-language.js";

export const pistonRuntimeSchema = z.object({
	language: puzzleLanguage,
	version: puzzleLanguageVersion,
	aliases: z.array(z.string()),
	runtime: z.string().optional()
});
export type PistonRuntime = z.infer<typeof pistonRuntimeSchema>;
