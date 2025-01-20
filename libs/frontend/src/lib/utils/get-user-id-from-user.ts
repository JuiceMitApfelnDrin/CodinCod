import { isString, type UserDto } from "types";

type User = UserDto | string;

export function getUserIdFromUser(user: User) {
	if (isString(user)) {
		return user;
	} else {
		return user._id;
	}
}

export function isUserIdInUserList(userId: string, players: User[] = []): boolean {
	return players.some((player) => getUserIdFromUser(player) === userId);
}
