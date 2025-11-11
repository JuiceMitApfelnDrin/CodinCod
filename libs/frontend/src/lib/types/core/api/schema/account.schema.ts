import { z } from "zod";
import { messageSchema } from "../../common/schema/message.schema.js";
import { preferencesDtoSchema } from "../../preferences/schema/preferences-dto.schema.js";
import { preferencesEntitySchema } from "../../preferences/schema/preferences-entity.schema.js";

// GET /account/preferences response
export const getPreferencesResponseSchema = preferencesDtoSchema;
export type GetPreferencesResponse = z.infer<
	typeof getPreferencesResponseSchema
>;

// POST /account/preferences request
export const createPreferencesRequestSchema = preferencesEntitySchema;
export type CreatePreferencesRequest = z.infer<
	typeof createPreferencesRequestSchema
>;

// POST /account/preferences response
export const createPreferencesResponseSchema = z.object({
	message: messageSchema,
	preferences: preferencesDtoSchema
});
export type CreatePreferencesResponse = z.infer<
	typeof createPreferencesResponseSchema
>;

// PUT /account/preferences request
export const updatePreferencesRequestSchema = preferencesEntitySchema.partial();
export type UpdatePreferencesRequest = z.infer<
	typeof updatePreferencesRequestSchema
>;

// PUT /account/preferences response
export const updatePreferencesResponseSchema = z.object({
	message: messageSchema,
	preferences: preferencesDtoSchema
});
export type UpdatePreferencesResponse = z.infer<
	typeof updatePreferencesResponseSchema
>;

// DELETE /account/preferences response
export const deletePreferencesResponseSchema = z.object({
	message: messageSchema
});
export type DeletePreferencesResponse = z.infer<
	typeof deletePreferencesResponseSchema
>;
