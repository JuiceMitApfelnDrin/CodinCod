import { z } from "zod";
import { themeOptionSchema } from "../enum/theme-option.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { editorPreferencesSchema } from "./editor.schema.js";

export const preferencesEntitySchema = z.object({
	owner: objectIdSchema,
	preferredLanguage: z.string().optional(),
	theme: themeOptionSchema.optional(),
	blockedUsers: z.set(objectIdSchema).prefault(new Set()).optional(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	editor: editorPreferencesSchema.optional(),
});

export type PreferencesEntity = z.infer<typeof preferencesEntitySchema>;
