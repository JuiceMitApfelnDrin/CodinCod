import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { programmingLanguageDtoSchema } from "../../programming-language/schema/programming-language-dto.schema.js";

export const solutionSchema = z.object({
	code: z.string().prefault(""),
	programmingLanguage: z
		.union([objectIdSchema, programmingLanguageDtoSchema])
		.optional(),
});
export type Solution = z.infer<typeof solutionSchema>;
