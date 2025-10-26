import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { banTypeEnum } from "../enum/ban-type-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";
import { BAN_CONFIG } from "../config/ban-config.js";

/**
 * User ban entity for tracking ban history
 */
export const userBanEntitySchema = z.object({
	_id: objectIdSchema.optional(),
	userId: objectIdSchema,
	bannedBy: objectIdSchema,
	banType: z.enum(getValues(banTypeEnum)),
	reason: z.string().min(BAN_CONFIG.reasonValidation.MIN_LENGTH).max(BAN_CONFIG.reasonValidation.MAX_LENGTH),
	startDate: acceptedDateSchema,
	endDate: acceptedDateSchema.optional(), // Undefined for permanent bans
	isActive: z.boolean().default(true),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
});

export type UserBanEntity = z.infer<typeof userBanEntitySchema>;

export function isUserBanEntity(data: unknown): data is UserBanEntity {
	return userBanEntitySchema.safeParse(data).success;
}

/**
 * Schema for creating a temporary ban
 */
export const createTemporaryBanSchema = z.object({
	userId: objectIdSchema,
	reason: z.string().min(BAN_CONFIG.reasonValidation.MIN_LENGTH).max(BAN_CONFIG.reasonValidation.MAX_LENGTH),
	durationMs: z.number().positive(),
});

export type CreateTemporaryBan = z.infer<typeof createTemporaryBanSchema>;

/**
 * Schema for creating a permanent ban
 */
export const createPermanentBanSchema = z.object({
	userId: objectIdSchema,
	reason: z.string().min(BAN_CONFIG.reasonValidation.MIN_LENGTH).max(BAN_CONFIG.reasonValidation.MAX_LENGTH),
});

export type CreatePermanentBan = z.infer<typeof createPermanentBanSchema>;

/**
 * Schema for unbanning a user
 */
export const unbanUserSchema = z.object({
	userId: objectIdSchema,
	reason: z.string().min(BAN_CONFIG.reasonValidation.MIN_LENGTH).max(BAN_CONFIG.reasonValidation.MAX_LENGTH),
});

export type UnbanUser = z.infer<typeof unbanUserSchema>;
