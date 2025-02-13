import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { preferencesEntitySchema } from "./preferences-entity.schema.js";

const basePreferencesDtoSchema = preferencesEntitySchema;

export const preferencesDtoSchema = basePreferencesDtoSchema.extend({
	_id: objectIdSchema
});

export type PreferencesDto = z.infer<typeof preferencesDtoSchema>;

export function isPreferencesDto(data: unknown): data is PreferencesDto {
	return preferencesDtoSchema.safeParse(data).success;
}
