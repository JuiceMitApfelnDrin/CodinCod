export const apiUrls = {
	ACCOUNT_PREFERENCES: `/api/account/preferences`,
	EXECUTE_CODE: `/api/execute-code`,
	SUBMIT_CODE: `/api/submit-code`,
	SUBMIT_GAME: `/api/submit-game`,
	SUPPORTED_LANGUAGES: `/api/supported-languages`,
	VERIFY_TOKEN: `/api/verify-token`,
	commentById: (id: string) => `/api/comment/${id}`,
	commentByIdComment: (id: string) => `/api/comment/${id}/comment`,
	commentByIdVote: (id: string) => `/api/comment/${id}/vote`,
	puzzleByIdComment: (id: string) => `/api/puzzles/${id}/comment`,
	submissionById: (id: string) => `/api/submission/${id}`,
	userByUsername: (username: string) => `/api/user/${username}`,
	userByUsernamePuzzle: (username: string) => `/api/user/${username}/puzzle`,
	usernameIsAvailable: (username: string) => `/api/username-is-available/${username}`
} as const;
