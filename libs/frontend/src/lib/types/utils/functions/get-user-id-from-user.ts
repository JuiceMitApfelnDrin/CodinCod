import type { UserDto } from "../../core/user/schema/user-dto.schema.js";
import { isString } from "./is-string.js";

export function getUserIdFromUser(user: unknown): string | null {
	if (!user) return null;

	if (isString(user)) {
		return user;
	}

	if (typeof user === "object" && user !== null && "_id" in user) {
		const id = user._id;

		return id ? String(id) : null;
	}

	return null;
}
