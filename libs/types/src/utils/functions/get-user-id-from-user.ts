import type { UserDto } from "../../core/user/schema/user-dto.schema.js";
import { isString } from "./is-string.js";

export function getUserIdFromUser(user: UserDto | string) {
	if (isString(user)) {
		return user;
	}
	return user._id.toString();
}
