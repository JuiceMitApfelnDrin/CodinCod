import { type Page, type Locator, expect } from "@playwright/test";
import {
	robustClick,
	robustFill,
	waitForPageReady,
	waitForElementReady,
	isElementVisible,
	getTextSafely,
} from "../utils/interaction-helpers.js";

/**
 * Enhanced Base page object class with robust interaction methods
 */
export class EnhancedBasePage {
	constructor(protected readonly page: Page) {}

	/**
	 * Navigate to a URL and wait for page to be ready
	 */
	async goto(path: string = ""): Promise<void> {
		await this.page.goto(path, { waitUntil: "domcontentloaded" });
		await waitForPageReady(this.page, { waitForNetworkIdle: true });
	}

	/**
	 * Click an element robustly
	 */
	protected async click(
		locator: Locator,
		waitForNetwork: boolean = false,
	): Promise<void> {
		await robustClick(locator, { waitForNetworkIdle: waitForNetwork });
	}

	/**
	 * Fill an input field robustly
	 */
	protected async fill(
		locator: Locator,
		value: string,
		pressEnter: boolean = false,
	): Promise<void> {
		await robustFill(locator, value, { pressEnter });
	}

	/**
	 * Check if element is visible
	 */
	protected async isVisible(locator: Locator): Promise<boolean> {
		return await isElementVisible(locator);
	}

	/**
	 * Get text content safely
	 */
	protected async getText(locator: Locator): Promise<string> {
		return await getTextSafely(locator);
	}

	/**
	 * Wait for element to be ready for interaction
	 */
	protected async waitForElement(
		locator: Locator,
		timeout?: number,
	): Promise<void> {
		await waitForElementReady(locator, { timeout });
	}

	/**
	 * Wait for navigation to complete
	 */
	async waitForNavigation(
		urlPattern?: RegExp,
		timeout: number = 30000,
	): Promise<void> {
		if (urlPattern) {
			await this.page.waitForURL(urlPattern, { timeout });
		}
		await waitForPageReady(this.page);
	}

	/**
	 * Get current URL
	 */
	getUrl(): string {
		return this.page.url();
	}

	/**
	 * Check if on expected URL
	 */
	async expectUrl(pattern: RegExp): Promise<void> {
		await expect(this.page).toHaveURL(pattern);
	}

	/**
	 * Take screenshot for debugging
	 */
	async screenshot(name: string): Promise<void> {
		await this.page.screenshot({
			path: `test-results/screenshots/${name}.png`,
			fullPage: true,
		});
	}
}
