import { z } from "zod";
import { preferencesDtoSchema } from "../../core/preferences/schema/preferences-dto.schema.js";
import { preferencesEntitySchema } from "../../core/preferences/schema/preferences-entity.schema.js";

// GET /account/preferences - Get user preferences
export const getPreferencesRequestSchema = z.object({});
export const getPreferencesSuccessResponseSchema = preferencesDtoSchema;

// PUT /account/preferences - Update user preferences
export const updatePreferencesRequestSchema = preferencesEntitySchema;
export const updatePreferencesSuccessResponseSchema = preferencesDtoSchema;

// DELETE /account/preferences - Delete user preferences
export const deletePreferencesRequestSchema = z.object({});
export const deletePreferencesSuccessResponseSchema = z.object({
	message: z.string().default("Preferences deleted successfully"),
});

// PATCH /account/preferences - Partially update user preferences
export const patchPreferencesRequestSchema = preferencesEntitySchema.partial();
export const patchPreferencesSuccessResponseSchema = preferencesDtoSchema;

// Common error response for account endpoints
export const accountErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

// Types
export type GetPreferencesRequest = z.infer<typeof getPreferencesRequestSchema>;
export type GetPreferencesSuccessResponse = z.infer<
	typeof getPreferencesSuccessResponseSchema
>;

export type UpdatePreferencesRequest = z.infer<
	typeof updatePreferencesRequestSchema
>;
export type UpdatePreferencesSuccessResponse = z.infer<
	typeof updatePreferencesSuccessResponseSchema
>;

export type DeletePreferencesRequest = z.infer<
	typeof deletePreferencesRequestSchema
>;
export type DeletePreferencesSuccessResponse = z.infer<
	typeof deletePreferencesSuccessResponseSchema
>;

export type PatchPreferencesRequest = z.infer<
	typeof patchPreferencesRequestSchema
>;
export type PatchPreferencesSuccessResponse = z.infer<
	typeof patchPreferencesSuccessResponseSchema
>;

export type AccountErrorResponse = z.infer<typeof accountErrorResponseSchema>;
