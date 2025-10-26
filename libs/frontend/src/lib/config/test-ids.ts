import type { ValueOf } from "types";

export const DATA_TESTID_STRING = "data-testid";

export const testIds = {
	// add comment form
	ADD_COMMENT_FORM_BUTTON_CANCEL_CREATING_COMMENT:
		"add-comment-form-button-cancel-creating-comment",
	ADD_COMMENT_FORM_BUTTON_SUBMIT_NEW_COMMENT:
		"add-comment-form-button-submit-new-comment",

	// become a contributor component
	BECOME_A_CONTRIBUTOR_COMPONENT_ANCHOR_GITHUB:
		"become-a-contributor-component-anchor-go-to-github",
	BECOME_A_CONTRIBUTOR_COMPONENT_ANCHOR_OPEN_AN_ISSUE:
		"become-a-contributor-component-anchor-open-an-issue",

	// chat component
	CHAT_COMPONENT_BUTTON_SEND_MESSAGE: "chat-component-button-send-message",

	// comment component
	COMMENT_COMPONENT_BUTTON_DOWNVOTE_COMMENT:
		"comment-component-button-downvote-comment",
	COMMENT_COMPONENT_BUTTON_HIDE_COMMENT:
		"comment-component-button-hide-comment",
	COMMENT_COMPONENT_BUTTON_REPLY_TO_COMMENT:
		"comment-component-button-reply-to-comment",
	COMMENT_COMPONENT_BUTTON_SHOW_REPLIES:
		"comment-component-button-show-replies",
	COMMENT_COMPONENT_BUTTON_UPVOTE_COMMENT:
		"comment-component-button-upvote-comment",

	// create puzzle form
	CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE:
		"create-puzzle-form-button-create-puzzle",

	// delete puzzle dialog
	DELETE_PUZZLE_DIALOG_BUTTON_DELETE_PUZZLE:
		"delete-puzzle-dialog-button-delete-puzzle",

	// display error component
	DISPLAY_ERROR_COMPONENT_ANCHOR_CUSTOM:
		"display-error-component-anchor-custom",

	// edit puzzle form
	EDIT_PUZZLE_FORM_BUTTON_ADD_VALIDATOR:
		"edit-puzzle-form-button-add-validator",
	EDIT_PUZZLE_FORM_BUTTON_REMOVE_VALIDATOR:
		"edit-puzzle-form-button-remove-validator",
	EDIT_PUZZLE_FORM_BUTTON_UPDATE_PUZZLE:
		"edit-puzzle-form-button-update-puzzle",

	// error component
	ERROR_COMPONENT_ANCHOR_HOMEPAGE: "error-component-anchor-homepage",

	// login form
	LOGIN_FORM_BUTTON_LOGIN: "login-form-button-login",
	LOGIN_FORM_INPUT_IDENTIFIER: "login-form-input-identifier",
	LOGIN_FORM_INPUT_PASSWORD: "login-form-input-password",

	// multiplayer by id page
	MULTIPLAYER_BY_ID_PAGE_ANCHOR_MULTIPLAYER:
		"multiplayer-by-id-page-anchor-multiplayer",
	MULTIPLAYER_BY_ID_PAGE_BUTTON_CREATE_THE_SAME_CONFIGURED_GAME:
		"multiplayer-by-id-page-button-create-the-same-configured-game",
	MULTIPLAYER_BY_ID_PAGE_BUTTON_JOIN_ONGOING_GAME:
		"multiplayer-by-id-page-button-join-ongoing-game",

	// multiplayer page
	MULTIPLAYER_PAGE_BUTTON_HOST_ROOM: "multiplayer-page-host-room",
	MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM: "multiplayer-page-join-room",
	MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM: "multiplayer-page-leave-room",
	MULTIPLAYER_PAGE_BUTTON_START_ROOM: "multiplayer-page-start-room",

	// main-navigation
	NAVIGATION_ANCHOR_HOME: "navigation-anchor-home",
	NAVIGATION_ANCHOR_LEARN: "navigation-anchor-learn",
	NAVIGATION_ANCHOR_LOGIN: "navigation-anchor-login",
	NAVIGATION_ANCHOR_PLAY: "navigation-anchor-play",
	NAVIGATION_ANCHOR_PUZZLES: "navigation-anchor-puzzles",
	NAVIGATION_MENU_ANCHOR_LOGOUT: "navigation-menu-anchor-logout",
	NAVIGATION_MENU_ANCHOR_PROFILE: "navigation-menu-anchor-profile",
	NAVIGATION_MENU_ANCHOR_SETTINGS: "navigation-menu-anchor-settings",
	NAVIGATION_MENU_BUTTON_OPEN: "navigation-menu-button-open",
	NAVIGATION_MENU_ANCHOR_MODERATION: "navigation-menu-anchor-moderation",
	NAVIGATION_TOGGLE_THEME: "navigation-toggle-theme",

	// moderation page
	MODERATION_PAGE_BUTTON_APPROVE_PUZZLE:
		"moderation-page-button-approve-puzzle",
	MODERATION_PAGE_BUTTON_REVISE_PUZZLE: "moderation-page-button-revise-puzzle",
	MODERATION_PAGE_BUTTON_RESOLVE_REPORT:
		"moderation-page-button-resolve-report",
	MODERATION_PAGE_BUTTON_REJECT_REPORT: "moderation-page-button-reject-report",
	MODERATION_PAGE_BUTTON_CANCEL_REVISION:
		"moderation-page-button-cancel-revision",
	MODERATION_PAGE_BUTTON_SUBMIT_REVISION:
		"moderation-page-button-submit-revision",
	MODERATION_PAGE_BUTTON_BAN_USER: "moderation-page-button-ban-user",
	MODERATION_PAGE_BUTTON_BAN_HISTORY: "moderation-page-button-ban-history",
	MODERATION_PAGE_BUTTON_CANCEL_BAN: "moderation-page-button-cancel-ban",
	MODERATION_PAGE_BUTTON_SUBMIT_BAN: "moderation-page-button-submit-ban",
	MODERATION_PAGE_BUTTON_CLOSE_HISTORY: "moderation-page-button-close-history",
	MODERATION_PAGE_BUTTON_UNBAN_USER: "moderation-page-button-unban-user",

	// chat message component
	CHAT_MESSAGE_COMPONENT_BUTTON_REPORT: "chat-message-component-button-report",

	// report chat dialog
	REPORT_CHAT_DIALOG_BUTTON_CANCEL: "report-chat-dialog-button-cancel",
	REPORT_CHAT_DIALOG_BUTTON_SUBMIT: "report-chat-dialog-button-submit",

	// maintenance page
	MAINTENANCE_PAGE_BUTTON_DISCORD: "maintenance-page-button-discord",

	// pagination
	PAGINATION_BUTTON_FIRST: "pagination-button-first",
	PAGINATION_BUTTON_LAST: "pagination-button-last",
	PAGINATION_BUTTON_NEXT: "pagination-button-next",
	PAGINATION_BUTTON_PREVIOUS: "pagination-button-previous",

	// play puzzle component
	PLAY_PUZZLE_COMPONENT_BUTTON_RUN_ALL_TESTS:
		"play-puzzle-component-button-run-all-tests",
	PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE:
		"play-puzzle-component-button-run-code",
	PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE:
		"play-puzzle-component-button-submit-code",

	// profile
	PROFILE_PAGE_BUTTON_USER_PUZZLES: "profile-page-button-user-puzzles",

	// puzzles by id page
	PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE: "puzzles-by-id-page-edit-puzzle",
	PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE: "puzzles-by-id-page-play-puzzle",

	// puzzles page
	PUZZLES_PAGE_ANCHOR_MY_PUZZLES: "puzzles-page-anchor-my-puzzles",
	PUZZLES_PAGE_ANCHOR_PUZZLE: "puzzles-page-anchor-puzzle",
	PUZZLES_PAGE_BUTTON_CREATE_PUZZLE: "puzzles-page-button-create-puzzle",

	// register form
	REGISTER_FORM_BUTTON_REGISTER: "register-form-button-register",

	// standings table component
	STANDINGS_TABLE_COMPONENT_TOGGLE_SHOW_CODE:
		"standings-table-component-toggle-show-code",

	// user hover card component
	USER_HOVER_CARD_COMPONENT_ANCHOR_USER_PROFILE:
		"user-hover-card-component-anchor-user-profile"
} as const;

type DataTestIdMap = typeof testIds;

export type DataTestIdProp = {
	[DATA_TESTID_STRING]: ValueOf<DataTestIdMap>;
};
