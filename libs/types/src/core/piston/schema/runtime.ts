import { z } from "zod";
import { puzzleLanguage } from "../../puzzle/schema/puzzle-language.js";

export const pistonRuntimeSchema = z.object({
	language: puzzleLanguage,
	version: z.string(),
	aliases: z.array(z.string()),
	runtime: z.string().optional()
});
export type PistonRuntime = z.infer<typeof pistonRuntimeSchema>;
