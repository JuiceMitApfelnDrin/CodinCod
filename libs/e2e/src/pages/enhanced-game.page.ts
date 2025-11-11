import type { Page, Locator } from "@playwright/test";
import { EnhancedBasePage } from "./enhanced-base.page.js";
import { testIds } from "@codincod/shared/constants/test-ids";
import { robustType } from "../utils/interaction-helpers.js";
import {
	waitForWebSocketConnection,
	getWebSocketStatus,
} from "../utils/websocket-helpers.js";

/**
 * Enhanced Game page object for multiplayer games
 */
export class EnhancedGamePage extends EnhancedBasePage {
	// Test ID based locators
	readonly submitCodeButton: Locator;
	readonly runCodeButton: Locator;
	readonly runAllTestsButton: Locator;
	readonly testResults: Locator;
	readonly consoleOutput: Locator;
	readonly playerRankings: Locator;
	readonly standingsTable: Locator;
	readonly connectionStatus: Locator;
	readonly chatInput: Locator;
	readonly chatSendButton: Locator;

	// Dynamic locators
	readonly codeEditor: Locator;
	readonly languageSelector: Locator;
	readonly timerDisplay: Locator;

	constructor(page: Page) {
		super(page);

		// Initialize test ID based locators
		this.submitCodeButton = page.getByTestId(
			testIds.PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE,
		);
		this.runCodeButton = page.getByTestId(
			testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE,
		);
		this.runAllTestsButton = page.getByTestId(
			testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_ALL_TESTS,
		);
		this.testResults = page.getByTestId(
			testIds.PLAY_PUZZLE_COMPONENT_TEST_RESULTS,
		);
		this.consoleOutput = page.getByTestId(
			testIds.PLAY_PUZZLE_COMPONENT_CONSOLE_OUTPUT,
		);
		this.playerRankings = page.getByTestId(
			testIds.GAME_COMPONENT_PLAYER_RANKINGS,
		);
		this.standingsTable = page.getByTestId(
			testIds.GAME_COMPONENT_STANDINGS_TABLE,
		);
		this.connectionStatus = page.getByTestId(
			testIds.GAME_COMPONENT_CONNECTION_STATUS,
		);
		this.chatInput = page.getByTestId(testIds.CHAT_COMPONENT_INPUT_MESSAGE);
		this.chatSendButton = page.getByTestId(
			testIds.CHAT_COMPONENT_BUTTON_SEND_MESSAGE,
		);

		// Dynamic locators (fallback to selectors when testIds not available)
		this.codeEditor = page
			.getByTestId(testIds.GAME_COMPONENT_CODE_EDITOR)
			.or(
				page
					.locator('.monaco-editor, .cm-editor, textarea[class*="editor"]')
					.first(),
			);
		this.languageSelector = page
			.getByTestId(testIds.GAME_COMPONENT_LANGUAGE_SELECTOR)
			.or(
				page
					.locator('select, [role="combobox"]')
					.filter({ hasText: /language/i })
					.first(),
			);
		this.timerDisplay = page
			.getByTestId(testIds.GAME_COMPONENT_TIMER)
			.or(page.locator("text=/\\d+:\\d+/").first());
	}

	/**
	 * Navigate to game by ID and wait for it to load
	 */
	async gotoGame(gameId: string): Promise<void> {
		await this.goto(`/multiplayer/${gameId}`);
		await this.waitForGameLoad(gameId);
	}

	/**
	 * Wait for game page to fully load
	 */
	async waitForGameLoad(
		gameId: string,
		timeout: number = 15000,
	): Promise<void> {
		// Wait for WebSocket connection to game channel
		await waitForWebSocketConnection(this.page, `game:${gameId}`, {
			timeout,
		}).catch((error) => {
			console.warn("Game WebSocket connection timeout:", error.message);
		});

		// Wait for code editor to be visible
		await this.waitForElement(this.codeEditor, timeout);
	}

	/**
	 * Type code into the editor
	 */
	async typeCode(code: string): Promise<void> {
		// Click editor to focus
		await this.click(this.codeEditor);

		// Clear existing code (Ctrl+A, Delete)
		await this.page.keyboard.press("Control+A");
		await this.page.keyboard.press("Delete");

		// Wait for editor to be ready
		await this.codeEditor.waitFor({ state: "visible" });

		// Type new code with natural delay
		await robustType(this.codeEditor, code, { delay: 10, clearFirst: false });
	}

	/**
	 * Run the code without submitting
	 */
	async runCode(): Promise<void> {
		await this.click(this.runCodeButton, true);

		// Wait for console output to appear or error message
		await Promise.race([
			this.consoleOutput.waitFor({ state: "visible" }),
			this.page
				.locator('[data-testid*="error"], .error-message')
				.first()
				.waitFor({ state: "visible" })
				.catch(() => {}),
		]);
	}

	/**
	 * Run all tests
	 */
	async runAllTests(): Promise<void> {
		await this.click(this.runAllTestsButton, true);

		// Wait for test results to appear
		await this.testResults.waitFor({ state: "visible" });
	}

	/**
	 * Submit the solution
	 */
	async submitSolution(): Promise<void> {
		await this.click(this.submitCodeButton, true);

		// Wait for submission result (success message or error)
		await Promise.race([
			this.page
				.locator("text=/submission.*successful|solution.*accepted/i")
				.first()
				.waitFor({ state: "visible" }),
			this.page
				.locator('[data-testid*="error"], .error-message')
				.first()
				.waitFor({ state: "visible" }),
			this.testResults.waitFor({ state: "visible" }),
		]);
	}

	/**
	 * Select programming language
	 */
	async selectLanguage(language: string): Promise<void> {
		await this.click(this.languageSelector);

		const option = this.page
			.locator(
				`option:has-text("${language}"), [role="option"]:has-text("${language}")`,
			)
			.first();

		// Wait for option to be available
		await option.waitFor({ state: "visible" });
		await this.click(option);

		// Wait for language change to be reflected
		await this.page
			.locator(`text="${language}"`)
			.first()
			.waitFor({ state: "visible" });
	}

	/**
	 * Send chat message in game
	 */
	async sendChatMessage(message: string): Promise<void> {
		if (!(await this.isVisible(this.chatInput))) {
			throw new Error("Chat not available in this game");
		}

		await this.fill(this.chatInput, message, true);

		// Wait for message to appear in chat
		await this.page
			.locator(`text="${message}"`)
			.first()
			.waitFor({ state: "visible" });
	}

	/**
	 * Get test results text
	 */
	async getTestResults(): Promise<string> {
		if (!(await this.isVisible(this.testResults))) {
			return "";
		}
		return await this.getText(this.testResults);
	}

	/**
	 * Get console output
	 */
	async getConsoleOutput(): Promise<string> {
		if (!(await this.isVisible(this.consoleOutput))) {
			return "";
		}
		return await this.getText(this.consoleOutput);
	}

	/**
	 * Check if all tests passed
	 */
	async didPassAllTests(): Promise<boolean> {
		const results = await this.getTestResults();
		const lowerResults = results.toLowerCase();

		return (
			lowerResults.includes("all tests passed") ||
			lowerResults.includes("success") ||
			(lowerResults.includes("passed") && !lowerResults.includes("failed"))
		);
	}

	/**
	 * Get player rankings/standings
	 */
	async getPlayerRankings(): Promise<string[]> {
		const rankings = (await this.isVisible(this.playerRankings))
			? this.playerRankings
			: this.standingsTable;

		if (!(await this.isVisible(rankings))) {
			return [];
		}

		const items = await rankings
			.locator('li, tr, [role="listitem"]')
			.allTextContents();
		return items.map((item) => item.trim()).filter((item) => item.length > 0);
	}

	/**
	 * Get remaining time
	 */
	async getRemainingTime(): Promise<string> {
		if (!(await this.isVisible(this.timerDisplay))) {
			return "";
		}
		return await this.getText(this.timerDisplay);
	}

	/**
	 * Get WebSocket connection status
	 */
	async getConnectionStatus(): Promise<string> {
		if (!(await this.isVisible(this.connectionStatus))) {
			return "unknown";
		}
		return await this.getText(this.connectionStatus);
	}

	/**
	 * Get WebSocket connection info
	 */
	async getWebSocketStatus(gameId: string): Promise<{
		isConnected: boolean;
		state: string;
		error?: string;
	}> {
		return await getWebSocketStatus(this.page, `game:${gameId}`);
	}

	/**
	 * Wait for game to end
	 */
	async waitForGameEnd(timeout: number = 120000): Promise<void> {
		// Wait for redirect to results or game over screen
		await Promise.race([
			this.page.waitForURL(/.*\/(results|game-over|summary)/, { timeout }),
			this.page
				.locator("text=/game over|time's up|game complete/i")
				.waitFor({ timeout }),
		]);
	}

	/**
	 * Check if game has started (not in lobby)
	 */
	async hasGameStarted(): Promise<boolean> {
		return await this.isVisible(this.codeEditor);
	}

	/**
	 * Check if player can see other players' progress
	 */
	async canSeeOtherPlayers(): Promise<boolean> {
		const rankings = await this.getPlayerRankings();
		return rankings.length > 1;
	}
}
