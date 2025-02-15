import { z } from "zod";
import { themeOptionSchema } from "../enum/theme-option.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { keyBindingSchema } from "../enum/key-binding.js";

export const preferencesEntitySchema = z.object({
	author: objectIdSchema,
	preferredLanguage: z.string().optional(),
	theme: themeOptionSchema.optional(),
	blockedUsers: z.set(objectIdSchema).default(new Set()).optional(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	ide: z
		.object({
			keyBinding: keyBindingSchema
		})
		.optional()
});

export type PreferencesEntity = z.infer<typeof preferencesEntitySchema>;
