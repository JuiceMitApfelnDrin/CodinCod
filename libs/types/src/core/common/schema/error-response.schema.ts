// This file is deprecated - use result.ts instead
// Kept for backwards compatibility during migration
import { z } from "zod";

export const legacyErrorResponseSchema = z.object({
	message: z.string(),
	error: z.string(),
});

export type LegacyErrorResponse = z.infer<typeof legacyErrorResponseSchema>;
