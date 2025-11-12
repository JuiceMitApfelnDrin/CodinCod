import type { Page, Locator } from "@playwright/test";
import { EnhancedBasePage } from "./enhanced-base.page.js";
import { testIds } from "@codincod/shared/constants/test-ids";
import {
	waitForWebSocketConnection,
	getWebSocketStatus,
} from "../utils/websocket-helpers.js";
import { waitForCondition } from "../utils/interaction-helpers.js";
import { ChatComponent } from "./components.ts/chat.components";
import { StandingsTableComponent } from "./components.ts/standings-table.components";

/**
 * Enhanced Multiplayer waiting room page object with robust methods
 */
export class EnhancedMultiplayerPage extends EnhancedBasePage {
	// Component objects
	readonly chatComponent: ChatComponent;
	readonly standingsTableComponent: StandingsTableComponent;

	// Test ID based locators (language-independent)
	readonly hostRoomButton: Locator;
	readonly joinRoomButton: Locator;
	readonly leaveRoomButton: Locator;
	readonly startGameButton: Locator;
	readonly customGameButton: Locator;
	readonly joinByInviteButton: Locator;
	readonly copyInviteButton: Locator;
	readonly toggleInviteCodeButton: Locator;

	constructor(page: Page) {
		super(page);

		// Initialize component objects
		this.chatComponent = new ChatComponent(page);
		this.standingsTableComponent = new StandingsTableComponent(page);

		// Initialize locators using shared test IDs
		this.hostRoomButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		this.joinRoomButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM,
		);
		this.leaveRoomButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM,
		);
		this.startGameButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM,
		);
		this.customGameButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_CUSTOM_GAME,
		);
		this.joinByInviteButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_BY_INVITE,
		);
		this.copyInviteButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_COPY_INVITE,
		);
		this.toggleInviteCodeButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_TOGGLE_INVITE_CODE,
		);
	}

	/**
	 * Navigate to multiplayer page and wait for it to load
	 */
	async gotoMultiplayer(): Promise<void> {
		await this.goto("/multiplayer");
		await this.waitForPageLoad();
	}

	/**
	 * Wait for multiplayer page to be fully loaded
	 */
	async waitForPageLoad(): Promise<void> {
		// Wait for WebSocket connection to waiting room channel
		await waitForWebSocketConnection(this.page, "waiting_room:lobby", {
			timeout: 15000,
		}).catch((error) => {
			console.warn(
				"WebSocket connection timeout (might be expected):",
				error.message,
			);
		});

		// Wait for at least one of the main action buttons to be visible
		await Promise.race([
			this.waitForElement(this.hostRoomButton),
			this.waitForElement(this.joinRoomButton),
		]);
	}

	/**
	 * Host a quick match room
	 */
	async hostQuickRoom(): Promise<void> {
		await this.click(this.hostRoomButton, true);

		// Wait for transition to in-room state
		await this.waitForInRoomState();
	}

	/**
	 * Join the first available room
	 */
	async joinFirstAvailableRoom(): Promise<void> {
		// Wait for at least one room to be available
		await this.waitForElement(this.joinRoomButton.first(), 10000);

		// Click the first join button
		await this.click(this.joinRoomButton.first(), true);

		// Wait for transition to in-room state
		await this.waitForInRoomState();
	}

	/**
	 * Join room by invite code
	 */
	async joinByInviteCode(code: string): Promise<void> {
		// Click join by invite button
		await this.click(this.joinByInviteButton);

		// Wait for dialog to open and input to be visible
		const dialogInput = this.page.getByTestId(
			testIds.JOIN_BY_INVITE_DIALOG_INPUT_CODE,
		);
		await this.waitForElement(dialogInput);

		// Fill in the invite code
		await this.fill(dialogInput, code);

		// Click join button in dialog
		const joinButton = this.page.getByTestId(
			testIds.JOIN_BY_INVITE_DIALOG_BUTTON_JOIN,
		);
		await this.click(joinButton, true);

		// Wait for transition to in-room state
		await this.waitForInRoomState();
	}

	/**
	 * Leave the current room
	 */
	async leaveRoom(): Promise<void> {
		await this.click(this.leaveRoomButton, true);

		// Wait for transition out of room state
		await waitForCondition(async () => !(await this.isInRoom()), {
			timeout: 5000,
			errorMessage: "Failed to leave room",
		});
	}

	/**
	 * Start the game (host only)
	 */
	async startGame(): Promise<void> {
		if (!(await this.isHost())) {
			throw new Error("Only the host can start the game");
		}

		await this.click(this.startGameButton, true);

		// Wait for countdown to start
		await this.waitForGameStartCountdown();
	}

	/**
	 * Send a chat message in the waiting room
	 */
	async sendChatMessage(message: string): Promise<void> {
		await this.chatComponent.sendMessage(message);
	}

	/**
	 * Get invite code for the room
	 */
	async getInviteCode(): Promise<string> {
		return await this.standingsTableComponent.getInviteCode();
	}

	/**
	 * Copy invite code to clipboard
	 */
	async copyInviteCode(): Promise<string> {
		await this.click(this.copyInviteButton);

		// Get the code from clipboard
		const clipboardText = await this.page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		return clipboardText;
	}

	/**
	 * Check if currently in a room
	 */
	async isInRoom(): Promise<boolean> {
		return await this.isVisible(this.leaveRoomButton);
	}

	/**
	 * Check if user is the host
	 */
	async isHost(): Promise<boolean> {
		return await this.isVisible(this.startGameButton);
	}

	/**
	 * Check if game is starting (countdown visible)
	 */
	async isGameStarting(): Promise<boolean> {
		const countdownTimer = this.page.getByTestId(
			testIds.MULTIPLAYER_PAGE_COUNTDOWN_TIMER,
		);
		return await this.isVisible(countdownTimer);
	}

	/**
	 * Get list of players in room
	 */
	async getPlayersInRoom(): Promise<string[]> {
		return await this.standingsTableComponent.getPlayers();
	}

	/**
	 * Get number of players in room
	 */
	async getPlayerCount(): Promise<number> {
		return await this.standingsTableComponent.getPlayerCount();
	}

	/**
	 * Get chat messages
	 */
	async getChatMessages(): Promise<string[]> {
		return await this.chatComponent.getMessages();
	}

	/**
	 * Get WebSocket connection status
	 */
	async getWebSocketStatus(): Promise<{
		isConnected: boolean;
		state: string;
		error?: string;
	}> {
		return await getWebSocketStatus(this.page, "waiting_room:lobby");
	}

	/**
	 * Wait for user to be in room
	 */
	private async waitForInRoomState(timeout: number = 10000): Promise<void> {
		await waitForCondition(async () => await this.isInRoom(), {
			timeout,
			errorMessage: "Timeout waiting to enter room",
		});
	}

	/**
	 * Wait for game start countdown to begin
	 */
	private async waitForGameStartCountdown(
		timeout: number = 10000,
	): Promise<void> {
		await waitForCondition(async () => await this.isGameStarting(), {
			timeout,
			errorMessage: "Timeout waiting for game start countdown",
		});
	}

	/**
	 * Wait for game to start and navigate to game page
	 */
	async waitForGameStart(timeout: number = 20000): Promise<void> {
		// Wait for URL to change to game page
		await this.page.waitForURL(/.*\/multiplayer\/[a-f0-9-]+/, { timeout });

		// Wait for game page to load
		await this.page
			.waitForLoadState("networkidle", { timeout: 5000 })
			.catch(() => {
				// Ignore timeout, game might have active WebSocket
			});
	}

	/**
	 * Wait for specific number of players in room
	 */
	async waitForPlayerCount(
		expectedCount: number,
		timeout: number = 30000,
	): Promise<void> {
		await waitForCondition(
			async () => {
				const count = await this.getPlayerCount();
				return count === expectedCount;
			},
			{
				timeout,
				interval: 1000,
				errorMessage: `Timeout waiting for ${expectedCount} players in room`,
			},
		);
	}
}
