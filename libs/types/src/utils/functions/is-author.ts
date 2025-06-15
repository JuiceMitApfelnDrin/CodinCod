import { isString } from "./is-string.js";

export function isAuthor(authorId: unknown, currentUserId: string): boolean {
	return isString(authorId) && authorId === currentUserId;
}
