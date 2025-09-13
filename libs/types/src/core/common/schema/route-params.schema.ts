import { z } from "zod";
import { objectIdSchema } from "./object-id.js";

// Common route parameter schemas

// Generic ID parameter (for /resource/:id routes)
export const idParamSchema = z.object({
	id: z.string().min(1)
});
export type IdParam = z.infer<typeof idParamSchema>;

// Username parameter (for /user/:username routes)
export const usernameParamSchema = z.object({
	username: z.string().min(1)
});
export type UsernameParam = z.infer<typeof usernameParamSchema>;

// ObjectId parameter (for resources that use MongoDB ObjectIds)
export const objectIdParamSchema = z.object({
	id: objectIdSchema
});
export type ObjectIdParam = z.infer<typeof objectIdParamSchema>;

// Username with ObjectId validation
export const usernameObjectIdParamSchema = z.object({
	username: objectIdSchema
});
export type UsernameObjectIdParam = z.infer<typeof usernameObjectIdParamSchema>;

// Common response schemas

// Empty response for 204 No Content
export const emptyResponseSchema = z.object({});
export type EmptyResponse = z.infer<typeof emptyResponseSchema>;
