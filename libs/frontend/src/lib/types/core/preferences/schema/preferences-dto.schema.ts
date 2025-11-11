import type { z } from "zod";
import { preferencesEntitySchema } from "./preferences-entity.schema.js";

const basePreferencesDtoSchema = preferencesEntitySchema;

export const preferencesDtoSchema = basePreferencesDtoSchema.omit({
	owner: true,
	updatedAt: true,
	createdAt: true
});

export type PreferencesDto = z.infer<typeof preferencesDtoSchema>;

export function isPreferencesDto(data: unknown): data is PreferencesDto {
	return preferencesDtoSchema.safeParse(data).success;
}
