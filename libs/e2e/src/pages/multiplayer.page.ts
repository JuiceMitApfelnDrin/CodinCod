import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { testIds, frontendUrls } from 'types';

/**
 * Page Object Model for the multiplayer waiting room page
 */
export class MultiplayerPage extends BasePage {
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
	readonly chatInput: Locator;
	readonly chatSendButton: Locator;
	readonly chatMessages: Locator;
	readonly connectionStatus: Locator;
	readonly countdownTimer: Locator;

	constructor(page: Page) {
		super(page);
		
		// Initialize locators using test IDs
		this.quickHostButton = page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM);
		this.customGameButton = page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_CUSTOM_GAME);
		this.joinByCodeButton = page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_BY_INVITE);
		this.leaveRoomButton = page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM);
		this.startGameButton = page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM);
		this.copyInviteButton = page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_COPY_INVITE);
		this.showCodeButton = page.getByTestId(testIds.STANDINGS_TABLE_COMPONENT_TOGGLE_SHOW_CODE);
		this.inviteCodeInput = page.locator('input[type="password"], input[type="text"]').filter({ has: page.locator('..').filter({ hasText: /invite code/i }) });
		this.roomsList = page.locator('ul').filter({ has: page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM) });
		this.playersList = page.locator('ul').filter({ hasText: /players in room/i });
		this.chatInput = page.getByTestId(testIds.CHAT_COMPONENT_INPUT_MESSAGE);
		this.chatSendButton = page.getByTestId(testIds.CHAT_COMPONENT_BUTTON_SEND_MESSAGE);
		this.chatMessages = page.getByTestId(testIds.CHAT_COMPONENT_MESSAGES_CONTAINER);
		this.connectionStatus = page.getByTestId(testIds.GAME_COMPONENT_CONNECTION_STATUS);
		this.countdownTimer = page.locator('text=/game starting soon|get ready/i').first();
	}

	/**
	 * Navigate to multiplayer page
	 */
	async gotoMultiplayer(): Promise<void> {
		await this.goto(frontendUrls.MULTIPLAYER);
	}

	/**
	 * Host a quick room
	 */
	async hostQuickRoom(): Promise<void> {
		await this.clickElement(this.quickHostButton);
		await this.page.waitForTimeout(1000); // Wait for room creation
	}

	/**
	 * Leave the current room
	 */
	async leaveRoom(): Promise<void> {
		await this.clickElement(this.leaveRoomButton);
		await this.page.waitForTimeout(500);
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
		
		// Wait for dialog to open
		await this.page.waitForTimeout(300);
		
		// Fill in the invite code
		const dialogInput = this.page.locator('input[placeholder*="code"], input[type="text"]').last();
		await this.fillInput(dialogInput, code);
		
		// Click join button in dialog using testId
		const joinButton = this.page.getByTestId(testIds.JOIN_BY_INVITE_DIALOG_BUTTON_JOIN);
		await this.clickElement(joinButton);
		
		await this.page.waitForTimeout(1000);
	}

	/**
	 * Join first available room from list
	 */
	async joinFirstAvailableRoom(): Promise<void> {
		const joinButton = this.page.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first();
		await this.clickElement(joinButton);
		await this.page.waitForTimeout(1000);
	}

	/**
	 * Get invite code from the room
	 */
	async getInviteCode(): Promise<string> {
		// Click show code button
		await this.clickElement(this.showCodeButton);
		await this.page.waitForTimeout(300);
		
		// Get the code
		const code = await this.inviteCodeInput.inputValue();
		
		// Hide code again
		await this.clickElement(this.showCodeButton);
		
		return code;
	}

	/**
	 * Send a chat message
	 */
	async sendChatMessage(message: string): Promise<void> {
		await this.fillInput(this.chatInput, message);
		await this.clickElement(this.chatSendButton);
		await this.page.waitForTimeout(500);
	}

	/**
	 * Get list of players in room
	 */
	async getPlayersInRoom(): Promise<string[]> {
		const items = await this.playersList.locator('li').allTextContents();
		return items.map(item => item.trim());
	}

	/**
	 * Check if in a room
	 */
	async isInRoom(): Promise<boolean> {
		return await this.isVisible(this.leaveRoomButton);
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
	async waitForGameStart(timeout: number = 20000): Promise<void> {
		await this.page.waitForURL('**/multiplayer/*', { timeout });
	}

	/**
	 * Check connection status
	 */
	async getConnectionStatus(): Promise<string> {
		if (!await this.isVisible(this.connectionStatus)) {
			return 'unknown';
		}
		return await this.getText(this.connectionStatus);
	}
}
