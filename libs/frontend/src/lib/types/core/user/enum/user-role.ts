import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const userRole = {
	MODERATOR: "moderator",
	USER: "user",
} as const;

export const userRoleSchema = z.enum(getValues(userRole));

export type UserRole = z.infer<typeof userRoleSchema>;

export const DEFAULT_USER_ROLE: UserRole = userRole.USER;

export function isModerator(data: unknown): boolean {
	return data === userRole.MODERATOR;
}
