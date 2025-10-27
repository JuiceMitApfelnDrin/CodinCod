import type { BanType } from "types";

export const apiUrls = {
	ACCOUNT_PREFERENCES: `/api/account/preferences`,
	EXECUTE_CODE: `/api/execute-code`,
	PROGRAMMING_LANGUAGES: `/api/programming-languages`,
	SUBMIT_CODE: `/api/submit-code`,
	SUBMIT_GAME: `/api/submit-game`,
	SUPPORTED_LANGUAGES: `/api/supported-languages`,
	commentById: (id: string) => `/api/comment/${id}`,
	commentByIdComment: (id: string) => `/api/comment/${id}/comment`,
	commentByIdVote: (id: string) => `/api/comment/${id}/vote`,
	puzzleByIdComment: (id: string) => `/api/puzzles/${id}/comment`,
	submissionById: (id: string) => `/api/submission/${id}`,
	userByUsername: (username: string) => `/api/user/${username}`,
	userByUsernamePuzzle: (username: string) => `/api/user/${username}/puzzle`,
	usernameIsAvailable: (username: string) =>
		`/api/username-is-available/${username}`,
	moderationPuzzleByIdApprove: (id: string) =>
		`/api/moderation/puzzle/${id}/approve`,
	moderationPuzzleByIdRevise: (id: string) =>
		`/api/moderation/puzzle/${id}/revise`,
	moderationReportByIdResolve: (id: string) =>
		`/api/moderation/report/${id}/resolve`,
	REPORT: `/api/report`,
	moderationUserByIdBanByType: (id: string, banType: BanType) =>
		`/api/moderation/user/${id}/ban/${banType}`,
	moderationUserByIdUnban: (id: string) => `/api/moderation/user/${id}/unban`,
	moderationUserByIdBanHistory: (id: string) =>
		`/api/moderation/user/${id}/ban/history`
} as const;
