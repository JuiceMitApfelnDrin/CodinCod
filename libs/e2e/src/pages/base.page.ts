import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object class that all page objects should extend.
 * Provides common functionality for navigation and waiting.
 */
export class BasePage {
	constructor(protected readonly page: Page) {}

	/**
	 * Navigate to the page
	 */
	async goto(path: string = ''): Promise<void> {
		await this.page.goto(path);
		await this.waitForPageLoad();
	}

	/**
	 * Wait for page to be fully loaded
	 */
	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle');
		await this.page.waitForLoadState('domcontentloaded');
	}

	/**
	 * Get the current URL
	 */
	getUrl(): string {
		return this.page.url();
	}

	/**
	 * Wait for an element to be visible
	 */
	async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout });
	}

	/**
	 * Click an element with retry logic
	 */
	async clickElement(locator: Locator): Promise<void> {
		await locator.waitFor({ state: 'visible' });
		await locator.click();
	}

	/**
	 * Fill input field
	 */
	async fillInput(locator: Locator, text: string): Promise<void> {
		await locator.waitFor({ state: 'visible' });
		await locator.fill(text);
	}

	/**
	 * Get text content of element
	 */
	async getText(locator: Locator): Promise<string> {
		await locator.waitFor({ state: 'visible' });
		return (await locator.textContent()) || '';
	}

	/**
	 * Check if element is visible
	 */
	async isVisible(locator: Locator): Promise<boolean> {
		try {
			await locator.waitFor({ state: 'visible', timeout: 3000 });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Take a screenshot
	 */
	async takeScreenshot(name: string): Promise<void> {
		await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
	}
}
