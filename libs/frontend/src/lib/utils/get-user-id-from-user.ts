import { isString, type UserDto } from "types";

export function getUserIdFromUser(user: UserDto | string) {
	if (isString(user)) {
		return user;
	} else {
		return user._id;
	}
}
