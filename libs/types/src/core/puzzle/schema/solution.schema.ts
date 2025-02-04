import { z } from "zod";

export const solutionSchema = z.object({
	code: z.string().default(""),
	language: z.string(),
	languageVersion: z.string()
});
