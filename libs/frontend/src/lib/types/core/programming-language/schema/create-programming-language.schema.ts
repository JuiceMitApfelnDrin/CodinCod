import { z } from "zod";

export const createProgrammingLanguageSchema = z.object({
	language: z.string().min(1, "Language name is required"),
	version: z.string().min(1, "Language version is required"),
	aliases: z.array(z.string()).prefault([]),
	runtime: z.string().optional(),
});

export type CreateProgrammingLanguage = z.infer<
	typeof createProgrammingLanguageSchema
>;
