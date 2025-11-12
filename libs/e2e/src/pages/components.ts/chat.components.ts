import { expect, type Locator, type Page } from "@playwright/test";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Component object model for chat functionality
 */
export class ChatComponent {
	readonly page: Page;
	readonly chatInput: Locator;
	readonly sendMessageButton: Locator;
	readonly messagesContainer: Locator;
	readonly chatMessageElements: Locator;

	constructor(page: Page) {
		this.page = page;

		this.chatInput = page.getByTestId(testIds.CHAT_COMPONENT_INPUT_MESSAGE);
		this.sendMessageButton = page.getByTestId(
			testIds.CHAT_COMPONENT_BUTTON_SEND_MESSAGE,
		);
		this.messagesContainer = page.getByTestId(
			testIds.CHAT_COMPONENT_MESSAGES_CONTAINER,
		);
		this.chatMessageElements = this.messagesContainer.getByTestId(
			testIds.CHAT_MESSAGE,
		);
	}

	/**
	 * Send a message in the chat
	 */
	async sendMessage(message: string): Promise<void> {
		await this.chatInput.fill(message);
		await this.sendMessageButton.click();

		// Wait for the message to appear in the chat
		await expect(
			this.messagesContainer.getByText(message).first(),
		).toBeVisible();
	}

	/**
	 * Get all messages in the chat
	 */
	async getMessages(): Promise<string[]> {
		const messages = await this.chatMessageElements.allTextContents();
		return messages.map((msg) => msg.trim()).filter((msg) => msg.length > 0);
	}

	/**
	 * Check if a specific message exists in the chat
	 */
	async hasMessage(message: string): Promise<boolean> {
		const messages = await this.getMessages();
		return messages.some((msg) => msg.includes(message));
	}

	/**
	 * Get count of messages in the chat
	 */
	async getMessageCount(): Promise<number> {
		return await this.chatMessageElements.count();
	}

	/**
	 * Wait for a specific message to appear
	 */
	async waitForMessage(
		message: string,
		timeout: number = 10000,
	): Promise<void> {
		await expect(this.messagesContainer.getByText(message).first()).toBeVisible(
			{ timeout },
		);
	}
}
