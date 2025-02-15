import { z } from "zod";
import { themeOptionSchema } from "../enum/theme-option.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const preferencesEntitySchema = z.object({
	author: objectIdSchema,
	programmingLanguage: z.string().optional(),
	theme: themeOptionSchema.optional(),
	blockedUsers: z.set(objectIdSchema).default(new Set()).optional(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional()
});

export type PreferencesEntity = z.infer<typeof preferencesEntitySchema>;
