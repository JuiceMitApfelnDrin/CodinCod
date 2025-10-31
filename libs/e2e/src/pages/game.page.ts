import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { testIds } from 'types';

/**
 * Page Object Model for the multiplayer game page
 */
export class GamePage extends BasePage {
	// Locators
	readonly codeEditor: Locator;
	readonly submitButton: Locator;
	readonly runButton: Locator;
	readonly languageSelector: Locator;
	readonly timerDisplay: Locator;
	readonly testResults: Locator;
	readonly playerRankings: Locator;
	readonly chatInput: Locator;
	readonly outputConsole: Locator;

	constructor(page: Page) {
		super(page);
		
		// Initialize locators using testIds where available
		this.codeEditor = page.locator('.monaco-editor, textarea[class*="editor"], .cm-editor').first();
		this.submitButton = page.getByTestId(testIds.PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE);
		this.runButton = page.getByTestId(testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE);
		this.languageSelector = page.locator('select, [role="combobox"]').filter({ hasText: /language/i }).first();
		this.timerDisplay = page.locator('text=/\\d+:\\d+/').first();
		this.testResults = page.locator('[data-testid*="test-result"], .test-results').first();
		this.playerRankings = page.locator('[data-testid*="ranking"], .rankings').first();
		this.chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
		this.outputConsole = page.locator('[data-testid*="console"], .console-output, pre').first();
	}

	/**
	 * Navigate to game by ID
	 */
	async gotoGame(gameId: string): Promise<void> {
		await this.goto(`/multiplayer/${gameId}`);
	}

	/**
	 * Type code in editor
	 */
	async typeCode(code: string): Promise<void> {
		await this.codeEditor.waitFor({ state: 'visible' });
		await this.codeEditor.click();
		
		// Clear existing code
		await this.page.keyboard.press('ControlOrMeta+A');
		await this.page.keyboard.press('Delete');
		
		// Type new code
		await this.page.keyboard.type(code, { delay: 10 });
	}

	/**
	 * Run the code
	 */
	async runCode(): Promise<void> {
		await this.clickElement(this.runButton);
		await this.page.waitForTimeout(1000);
	}

	/**
	 * Submit the solution
	 */
	async submitSolution(): Promise<void> {
		await this.clickElement(this.submitButton);
		await this.page.waitForTimeout(1000);
	}

	/**
	 * Select programming language
	 */
	async selectLanguage(language: string): Promise<void> {
		await this.clickElement(this.languageSelector);
		await this.page.locator(`option:text("${language}"), [role="option"]:text("${language}")`).click();
	}

	/**
	 * Get remaining time
	 */
	async getRemainingTime(): Promise<string> {
		return await this.getText(this.timerDisplay);
	}

	/**
	 * Get test results
	 */
	async getTestResults(): Promise<string> {
		if (!await this.isVisible(this.testResults)) {
			return '';
		}
		return await this.getText(this.testResults);
	}

	/**
	 * Check if solution passed all tests
	 */
	async didPassAllTests(): Promise<boolean> {
		const results = await this.getTestResults();
		return results.includes('passed') || results.includes('success') || results.includes('✓');
	}

	/**
	 * Get player rankings
	 */
	async getPlayerRankings(): Promise<string[]> {
		if (!await this.isVisible(this.playerRankings)) {
			return [];
		}
		const items = await this.playerRankings.locator('li, tr').allTextContents();
		return items.map(item => item.trim());
	}

	/**
	 * Send chat message
	 */
	async sendChatMessage(message: string): Promise<void> {
		await this.fillInput(this.chatInput, message);
		await this.page.keyboard.press('Enter');
		await this.page.waitForTimeout(500);
	}

	/**
	 * Get console output
	 */
	async getConsoleOutput(): Promise<string> {
		if (!await this.isVisible(this.outputConsole)) {
			return '';
		}
		return await this.getText(this.outputConsole);
	}

	/**
	 * Wait for game to end
	 */
	async waitForGameEnd(timeout: number = 120000): Promise<void> {
		// Wait for either redirect or end screen
		await Promise.race([
			this.page.waitForURL('**/results', { timeout }),
			this.page.locator('text=/game over|time\'s up/i').waitFor({ timeout })
		]);
	}
}
