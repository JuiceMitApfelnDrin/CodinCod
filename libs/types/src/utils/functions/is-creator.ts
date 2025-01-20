import { isAuthor } from "./is-author.js";

export function isCreator(authorId: any, currentUserId: string): boolean {
	// for now the logic if it is a creator or author is identical, maybe could be renamed to isOwner later
	return isAuthor(authorId, currentUserId);
}
