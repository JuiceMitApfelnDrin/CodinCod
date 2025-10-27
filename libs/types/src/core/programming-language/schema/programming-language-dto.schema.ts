import { z } from "zod";
import { programmingLanguageEntitySchema } from "./programming-language-entity.schema.js";

export const programmingLanguageDtoSchema =
	programmingLanguageEntitySchema.omit({
		createdAt: true,
		updatedAt: true,
	});

export type ProgrammingLanguageDto = z.infer<
	typeof programmingLanguageDtoSchema
>;
