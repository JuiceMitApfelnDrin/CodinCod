export function isAuthor(authorId: any, currentUserId: string): boolean {
	return authorId && authorId === currentUserId;
}
