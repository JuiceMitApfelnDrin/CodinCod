/**
 * Test IDs for E2E testing
 * Centralizes data-testid attributes used in tests
 */

export const testIds = {
	// Authentication
	LOGIN_FORM: "login-form",
	LOGIN_EMAIL: "login-email",
	LOGIN_PASSWORD: "login-password",
	LOGIN_SUBMIT: "login-submit",
	REGISTER_FORM: "register-form",
	REGISTER_USERNAME: "register-username",
	REGISTER_EMAIL: "register-email",
	REGISTER_PASSWORD: "register-password",
	REGISTER_PASSWORD_CONFIRM: "register-password-confirm",
	REGISTER_SUBMIT: "register-submit",
	LOGOUT_BUTTON: "logout-button",

	// Navigation
	NAV_HOME: "nav-home",
	NAV_PUZZLES: "nav-puzzles",
	NAV_MULTIPLAYER: "nav-multiplayer",
	NAV_LEADERBOARDS: "nav-leaderboards",
	NAV_PROFILE: "nav-profile",
	NAV_SETTINGS: "nav-settings",

	// Puzzles
	PUZZLE_LIST: "puzzle-list",
	PUZZLE_CARD: "puzzle-card",
	PUZZLE_CREATE_BUTTON: "puzzle-create-button",
	PUZZLE_CREATE_FORM: "puzzle-create-form",
	PUZZLE_EDIT_FORM: "puzzle-edit-form",
	PUZZLE_DELETE_BUTTON: "puzzle-delete-button",
	PUZZLE_DELETE_CONFIRM: "puzzle-delete-confirm",
	PUZZLE_TITLE: "puzzle-title",
	PUZZLE_STATEMENT: "puzzle-statement",
	PUZZLE_DIFFICULTY: "puzzle-difficulty",
	PUZZLE_VISIBILITY: "puzzle-visibility",
	PUZZLE_SUBMIT_CODE: "puzzle-submit-code",
	PUZZLE_RUN_CODE: "puzzle-run-code",
	PUZZLE_CODE_EDITOR: "puzzle-code-editor",
	PUZZLE_OUTPUT: "puzzle-output",
	PUZZLE_TEST_RESULTS: "puzzle-test-results",

	// Multiplayer
	MULTIPLAYER_CREATE: "multiplayer-create",
	MULTIPLAYER_JOIN: "multiplayer-join",
	MULTIPLAYER_GAME: "multiplayer-game",
	MULTIPLAYER_CHAT: "multiplayer-chat",
	MULTIPLAYER_STANDINGS: "multiplayer-standings",

	// Profile
	PROFILE_INFO: "profile-info",
	PROFILE_PUZZLES: "profile-puzzles",
	PROFILE_ACTIVITY: "profile-activity",
	PROFILE_STATS: "profile-stats",
	PROFILE_EDIT_BUTTON: "profile-edit-button",

	// Settings
	SETTINGS_PROFILE_FORM: "settings-profile-form",
	SETTINGS_ACCOUNT_FORM: "settings-account-form",
	SETTINGS_APPEARANCE_FORM: "settings-appearance-form",
	SETTINGS_PREFERENCES_FORM: "settings-preferences-form",

	// Moderation
	MODERATION_REPORTS: "moderation-reports",
	MODERATION_REVIEWS: "moderation-reviews",
	MODERATION_BAN_USER: "moderation-ban-user",

	// Common
	LOADING_SPINNER: "loading-spinner",
	ERROR_MESSAGE: "error-message",
	SUCCESS_MESSAGE: "success-message",
	CONFIRM_DIALOG: "confirm-dialog",
	CANCEL_BUTTON: "cancel-button",
	SUBMIT_BUTTON: "submit-button",
	SAVE_BUTTON: "save-button"
} as const;

export type TestId = (typeof testIds)[keyof typeof testIds];
