import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

export const programmingLanguageEntitySchema = z.object({
	_id: objectIdSchema.optional(),
	language: z.string().min(1, "Language name is required"),
	version: z.string().min(1, "Language version is required"),
	aliases: z.array(z.string()).prefault([]),
	runtime: z.string().optional(),
	createdAt: acceptedDateSchema.prefault(() => new Date()),
	updatedAt: acceptedDateSchema.prefault(() => new Date()),
});

export type ProgrammingLanguageEntity = z.infer<
	typeof programmingLanguageEntitySchema
>;
