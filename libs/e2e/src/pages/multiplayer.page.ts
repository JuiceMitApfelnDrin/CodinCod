import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { testIds } from "@codincod/shared/constants/test-ids";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { ChatComponent } from "./components.ts/chat.components";
import { StandingsTableComponent } from "./components.ts/standings-table.components";

/**
 * Page Object Model for the multiplayer waiting room page
 */
export class MultiplayerPage extends BasePage {
	// Component objects
	readonly chatComponent: ChatComponent;
	readonly standingsTableComponent: StandingsTableComponent;

	// Locators
	readonly quickHostButton: Locator;
	readonly customGameButton: Locator;
	readonly joinByCodeButton: Locator;
	readonly leaveRoomButton: Locator;
	readonly startGameButton: Locator;
	readonly copyInviteButton: Locator;
	readonly showCodeButton: Locator;
	readonly inviteCodeInput: Locator;
	readonly roomsList: Locator;
	readonly playersList: Locator;
	readonly connectionStatus: Locator;
	readonly countdownTimer: Locator;

	constructor(page: Page) {
		super(page);

		// Initialize component objects
		this.chatComponent = new ChatComponent(page);
		this.standingsTableComponent = new StandingsTableComponent(page);

		// Initialize locators using test IDs
		this.quickHostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		this.customGameButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_CUSTOM_GAME,
		);
		this.joinByCodeButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_BY_INVITE,
		);
		this.leaveRoomButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM,
		);
		this.startGameButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM,
		);
		this.copyInviteButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_COPY_INVITE,
		);
		this.showCodeButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_TOGGLE_INVITE_CODE,
		);
		this.inviteCodeInput = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_INPUT_INVITE_CODE,
		);
		this.roomsList = page.locator("ul").filter({
			has: page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM),
		});
		this.playersList = page.getByTestId(testIds.MULTIPLAYER_PAGE_PLAYERS_LIST);
		this.connectionStatus = page.getByTestId(
			testIds.GAME_COMPONENT_CONNECTION_STATUS,
		);
		this.countdownTimer = page
			.locator("text=/game starting soon|get ready/i")
			.first();
	}

	/**
	 * Navigate to multiplayer page
	 */
	async gotoMultiplayer(): Promise<void> {
		await this.goto(frontendUrls.MULTIPLAYER);
		// Wait for DOM first (not networkidle, as SvelteKit HMR keeps connections open)
		await this.page.waitForLoadState("domcontentloaded");
		// Now wait for WebSocket to connect
		await this.waitForWebSocketConnection();
	}

	/**
	 * Wait for WebSocket connection to be established
	 * This is proven by the host button becoming visible
	 */
	async waitForWebSocketConnection(timeout: number = 15000): Promise<void> {
		// Wait for page to be ready first
		await this.page.waitForLoadState("domcontentloaded");

		// Wait for the host button to appear (proves WebSocket is connected)
		// If it doesn't appear, WebSocket failed to connect
		try {
			await this.quickHostButton.waitFor({ state: "visible", timeout });
			console.log(
				"[MultiplayerPage] WebSocket connected successfully - host button visible",
			);
		} catch (e) {
			// Check if the reconnecting button is visible
			const reconnectButton = this.page.getByText(
				/reconnecting.*click to retry/i,
			);
			const isReconnecting = await reconnectButton
				.isVisible()
				.catch(() => false);

			if (isReconnecting) {
				throw new Error(
					'WebSocket failed to connect - "Reconnecting" button is visible',
				);
			}

			throw new Error(
				`WebSocket connection uncertain - host button not visible within ${timeout}ms`,
			);
		}
	}

	/**
	 * Host a quick room
	 */
	async hostQuickRoom(): Promise<void> {
		await this.clickElement(this.quickHostButton);
		await this.waitForInRoom(); // Wait for WebSocket response
	}

	/**
	 * Leave the current room
	 */
	async leaveRoom(): Promise<void> {
		await this.clickElement(this.leaveRoomButton);
		// Wait for the leave button to disappear (we're no longer in a room)
		await this.leaveRoomButton.waitFor({ state: "hidden" });
	}

	/**
	 * Start the game (host only)
	 */
	async startGame(): Promise<void> {
		await this.clickElement(this.startGameButton);
	}

	/**
	 * Join a room by invite code
	 */
	async joinByInviteCode(code: string): Promise<void> {
		await this.clickElement(this.joinByCodeButton);

		// Wait for dialog to appear
		const dialogInput = this.page
			.locator('input[placeholder*="code"], input[type="text"]')
			.last();
		await dialogInput.waitFor({ state: "visible" });

		// Fill in the invite code
		await this.fillInput(dialogInput, code);

		// Click join button in dialog using testId
		const joinButton = this.page.getByTestId(
			testIds.JOIN_BY_INVITE_DIALOG_BUTTON_JOIN,
		);
		await this.clickElement(joinButton);

		// Wait until we're in the room
		await this.waitForInRoom();
	}

	/**
	 * Join first available room from list
	 */
	async joinFirstAvailableRoom(): Promise<void> {
		const joinButton = this.page
			.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
			.first();
		await this.clickElement(joinButton);
		// Wait until we're in the room
		await this.waitForInRoom();
	}

	/**
	 * Join the most recently created room (last in the list)
	 * Rooms appear in chronological order with newest last
	 */
	async joinNewestRoom(): Promise<void> {
		const joinButton = this.page
			.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
			.last(); // Get the last button (newest room)
		await this.clickElement(joinButton);
		// Wait until we're in the room
		await this.waitForInRoom();
	}

	/**
	 * Get invite code from the room
	 */
	async getInviteCode(): Promise<string> {
		return await this.standingsTableComponent.getInviteCode();
	}

	/**
	 * Send a chat message
	 */
	async sendChatMessage(message: string): Promise<void> {
		await this.chatComponent.sendMessage(message);
	}

	/**
	 * Get list of players in room
	 */
	async getPlayersInRoom(): Promise<string[]> {
		return await this.standingsTableComponent.getPlayers();
	}

	/**
	 * Check if in a room
	 */
	async isInRoom(): Promise<boolean> {
		return await this.isVisible(this.leaveRoomButton);
	}

	/**
	 * Wait until in a room (leave button appears)
	 */
	async waitForInRoom(): Promise<void> {
		await this.leaveRoomButton.waitFor({ state: "visible" });
	}

	/**
	 * Check if user is host
	 */
	async isHost(): Promise<boolean> {
		return await this.isVisible(this.startGameButton);
	}

	/**
	 * Check if game is starting (countdown visible)
	 */
	async isGameStarting(): Promise<boolean> {
		return await this.isVisible(this.countdownTimer);
	}

	/**
	 * Wait for game to start and redirect
	 */
	async waitForGameStart(): Promise<void> {
		await this.page.waitForURL("**/multiplayer/*");
	}

	/**
	 * Check connection status
	 */
	async getConnectionStatus(): Promise<string> {
		if (!(await this.isVisible(this.connectionStatus))) {
			return "unknown";
		}
		return await this.getText(this.connectionStatus);
	}
}
