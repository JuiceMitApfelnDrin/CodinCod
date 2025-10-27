import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { programmingLanguageDtoSchema } from "../../programming-language/schema/programming-language-dto.schema.js";

export const solutionSchema = z.object({
	code: z.string().prefault(""),
	programmingLanguage: objectIdSchema
		.or(programmingLanguageDtoSchema)
		.optional(),
	// Deprecated fields - keeping for backward compatibility during migration
	language: z.string().optional(),
	languageVersion: z.string().optional(),
});
export type Solution = z.infer<typeof solutionSchema>;
