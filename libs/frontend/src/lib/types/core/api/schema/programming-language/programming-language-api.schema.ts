import { z } from "zod";
import { errorResponseSchema } from "../../../common/schema/error-response.schema.js";
import { objectIdSchema } from "../../../common/schema/object-id.js";
import { programmingLanguageDtoSchema } from "../../../programming-language/schema/programming-language-dto.schema.js";

/**
 * GET /programming-language - List all available programming languages
 */
export const getProgrammingLanguagesResponseSchema = z.array(
	programmingLanguageDtoSchema
);

export type GetProgrammingLanguagesResponse = z.infer<
	typeof getProgrammingLanguagesResponseSchema
>;

/**
 * GET /programming-language/:id - Get programming language by ID
 */
export const getProgrammingLanguageByIdRequestSchema = z.object({
	id: objectIdSchema
});

export const getProgrammingLanguageByIdResponseSchema =
	programmingLanguageDtoSchema.or(errorResponseSchema);

export type GetProgrammingLanguageByIdRequest = z.infer<
	typeof getProgrammingLanguageByIdRequestSchema
>;
export type GetProgrammingLanguageByIdResponse = z.infer<
	typeof getProgrammingLanguageByIdResponseSchema
>;
