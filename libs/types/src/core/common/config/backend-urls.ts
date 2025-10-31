import { BanType } from "../../moderation/schema/ban-type.schema.js";

export const baseRoute = "/api/v1";

export const backendUrls = {
	ROOT: "/",
	REGISTER: `${baseRoute}/register`,
	LOGIN: `${baseRoute}/login`,
	LOGOUT: `${baseRoute}/logout`,
	USER_ME: `${baseRoute}/user/me`,
	USER: `${baseRoute}/user`,
	userByUsername: (username: string) => `${baseRoute}/user/${username}`,
	userByUsernamePuzzle: (username: string) =>
		`${baseRoute}/user/${username}/puzzle`,
	userByUsernameActivity: (username: string) =>
		`${baseRoute}/user/${username}/activity`,
	userByUsernameIsAvailable: (username: string) =>
		`${baseRoute}/user/${username}/isAvailable`,
	ACCOUNT: `${baseRoute}/account`,
	ACCOUNT_PREFERENCES: `${baseRoute}/account/preferences`,
	EXECUTE: `${baseRoute}/execute`,

	// puzzle routes
	PUZZLE: `${baseRoute}/puzzle`,
	puzzleById: (id: string) => `${baseRoute}/puzzle/${id}`,
	puzzleByIdComment: (id: string) => `${baseRoute}/puzzle/${id}/comment`,
	puzzleByIdSolution: (id: string) => `${baseRoute}/puzzle/${id}/solution`,

	// programming language routes
	PROGRAMMING_LANGUAGE: `${baseRoute}/programming-language`,
	programmingLanguageById: (id: string) =>
		`${baseRoute}/programming-language/${id}`,

	// comment
	COMMENT: `${baseRoute}/comment`,
	commentById: (id: string) => `${baseRoute}/comment/${id}`,
	commentByIdComment: (id: string) => `${baseRoute}/comment/${id}/comment`,
	commentByIdVote: (id: string) => `${baseRoute}/comment/${id}/vote`,

	HEALTH: `${baseRoute}/health`,
	VALIDATOR: `${baseRoute}/validator`,
	SUBMISSION: `${baseRoute}/submission`,
	submissionById: (id: string) => `${baseRoute}/submission/${id}`,
	SUBMISSION_GAME: `${baseRoute}/submission/game`,

	// leaderboard routes
	LEADERBOARD_RECALCULATE: `${baseRoute}/leaderboard/recalculate`,
	leaderboardByGameMode: (gameMode: string) =>
		`${baseRoute}/leaderboard/${gameMode}`,
	leaderboardUserById: (id: string) => `${baseRoute}/leaderboard/user/${id}`,

	// moderation routes
	MODERATION_REVIEW: `${baseRoute}/moderation/review`,
	moderationPuzzleApprove: (id: string) =>
		`${baseRoute}/moderation/puzzle/${id}/approve`,
	moderationPuzzleRevise: (id: string) =>
		`${baseRoute}/moderation/puzzle/${id}/revise`,
	moderationReportResolve: (id: string) =>
		`${baseRoute}/moderation/report/${id}/resolve`,
	REPORT: `${baseRoute}/report`,
	moderationUserByIdBanByType: (userId: string, banType: BanType) =>
		`${baseRoute}/moderation/user/${userId}/ban/${banType}`,
	moderationUserByIdBanHistory: (userId: string) =>
		`${baseRoute}/moderation/user/${userId}/ban/history`,
	moderationUserByIdUnban: (userId: string) =>
		`${baseRoute}/moderation/user/${userId}/unban`,
} as const;

export const backendParams = {
	USERNAME: ":username",
	ID: ":id",
	TYPE: ":type",
	GAME_MODE: ":gameMode",
} as const;
