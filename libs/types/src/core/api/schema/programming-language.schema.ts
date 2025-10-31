import { z } from "zod";
import { programmingLanguageDtoSchema } from "../../programming-language/schema/programming-language-dto.schema.js";
import { paginatedQueryResponseSchema } from "../../common/schema/paginated-query-response.schema.js";

// GET /programming-language response
export const programmingLanguagesResponseSchema = z.object({
	languages: z.array(programmingLanguageDtoSchema),
});
export type ProgrammingLanguagesResponse = z.infer<
	typeof programmingLanguagesResponseSchema
>;

// GET /programming-language/:id response
export const programmingLanguageByIdResponseSchema =
	programmingLanguageDtoSchema;
export type ProgrammingLanguageByIdResponse = z.infer<
	typeof programmingLanguageByIdResponseSchema
>;

// GET /programming-language/supported (filtered unique languages)
export const supportedLanguagesResponseSchema = z.object({
	languages: z.array(z.string()),
});
export type SupportedLanguagesResponse = z.infer<
	typeof supportedLanguagesResponseSchema
>;
