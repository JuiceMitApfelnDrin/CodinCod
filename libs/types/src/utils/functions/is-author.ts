export function isAuthor(authorId: string, currentUserId: string): boolean {
	return authorId === currentUserId;
}
