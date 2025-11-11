import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Maximum time to wait for elements (in milliseconds)
 */
const DEFAULT_ELEMENT_TIMEOUT = 10000;
const DEFAULT_NETWORK_IDLE_TIMEOUT = 5000;
const DEFAULT_ANIMATION_WAIT = 300;

/**
 * Retry configuration
 */
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

/**
 * Robust click helper that ensures element is ready before clicking
 *
 * Waits for:
 * - Element to be attached to DOM
 * - Element to be visible
 * - Element to be enabled
 * - No animations/transitions are running
 * - Element is not covered by other elements
 *
 * @param locator - Playwright locator for the element
 * @param options - Optional configuration
 */
export async function robustClick(
	locator: Locator,
	options: {
		timeout?: number;
		force?: boolean;
		waitForNetworkIdle?: boolean;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const page = locator.page();

	// Wait for element to be ready
	await waitForElementReady(locator, { timeout });

	// Optional: wait for network to be idle (useful after navigation or API calls)
	if (options.waitForNetworkIdle) {
		await page.waitForLoadState("networkidle", {
			timeout: DEFAULT_NETWORK_IDLE_TIMEOUT,
		});
	}

	// Small delay to ensure animations complete
	await page.waitForTimeout(DEFAULT_ANIMATION_WAIT);

	// Perform the click with retry logic
	await retryOperation(async () => {
		if (options.force) {
			await locator.click({ force: true, timeout });
		} else {
			await locator.click({ timeout });
		}
	}, MAX_RETRY_ATTEMPTS);
}

/**
 * Robust fill helper that ensures input is ready and properly filled
 *
 * @param locator - Playwright locator for the input element
 * @param value - Value to fill
 * @param options - Optional configuration
 */
export async function robustFill(
	locator: Locator,
	value: string,
	options: {
		timeout?: number;
		clearFirst?: boolean;
		pressEnter?: boolean;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const clearFirst = options.clearFirst ?? true;
	const page = locator.page();

	// Wait for element to be ready
	await waitForElementReady(locator, { timeout });

	// Clear existing value if requested
	if (clearFirst) {
		await locator.clear({ timeout });
		await page.waitForTimeout(100);
	}

	// Fill the value with retry logic
	await retryOperation(async () => {
		await locator.fill(value, { timeout });
	}, MAX_RETRY_ATTEMPTS);

	// Verify the value was set correctly
	const actualValue = await locator.inputValue();
	if (actualValue !== value) {
		throw new Error(
			`Failed to fill input. Expected: "${value}", Got: "${actualValue}"`,
		);
	}

	// Press Enter if requested
	if (options.pressEnter) {
		await page.keyboard.press("Enter");
		await page.waitForTimeout(DEFAULT_ANIMATION_WAIT);
	}
}

/**
 * Robust type helper for typing into input fields with natural delay
 *
 * @param locator - Playwright locator for the input element
 * @param text - Text to type
 * @param options - Optional configuration
 */
export async function robustType(
	locator: Locator,
	text: string,
	options: {
		timeout?: number;
		delay?: number;
		clearFirst?: boolean;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const delay = options.delay ?? 50;
	const clearFirst = options.clearFirst ?? true;
	const page = locator.page();

	// Wait for element to be ready
	await waitForElementReady(locator, { timeout });

	// Focus the element
	await locator.focus({ timeout });

	// Clear if requested
	if (clearFirst) {
		await page.keyboard.press("Control+A");
		await page.keyboard.press("Backspace");
		await page.waitForTimeout(100);
	}

	// Type the text
	await page.keyboard.type(text, { delay });
}

/**
 * Wait for element to be fully ready for interaction
 *
 * @param locator - Playwright locator for the element
 * @param options - Optional configuration
 */
export async function waitForElementReady(
	locator: Locator,
	options: {
		timeout?: number;
		checkEnabled?: boolean;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const checkEnabled = options.checkEnabled ?? true;

	// Wait for element to be attached
	await locator.waitFor({ state: "attached", timeout });

	// Wait for element to be visible
	await locator.waitFor({ state: "visible", timeout });

	// Check if element is enabled (for buttons, inputs, etc.)
	if (checkEnabled) {
		await expect(locator).toBeEnabled({ timeout });
	}
}

/**
 * Wait for all loading indicators to disappear
 *
 * @param page - Playwright page object
 * @param options - Optional configuration
 */
export async function waitForLoadingComplete(
	page: Page,
	options: {
		timeout?: number;
		additionalSelectors?: string[];
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const additionalSelectors = options.additionalSelectors ?? [];

	// Common loading indicator selectors
	const defaultSelectors = [
		'[aria-busy="true"]',
		'[data-loading="true"]',
		".loading",
		".spinner",
		'[role="progressbar"]',
		".skeleton",
	];

	const allSelectors = [...defaultSelectors, ...additionalSelectors];

	// Wait for all loading indicators to be hidden
	for (const selector of allSelectors) {
		const loadingIndicator = page.locator(selector).first();
		const isVisible = await loadingIndicator.isVisible().catch(() => false);

		if (isVisible) {
			await loadingIndicator.waitFor({ state: "hidden", timeout }).catch(() => {
				// Ignore if element disappears before we can wait for it
			});
		}
	}

	// Wait for network to be idle
	await page
		.waitForLoadState("networkidle", { timeout: DEFAULT_NETWORK_IDLE_TIMEOUT })
		.catch(() => {
			// Ignore timeout, some pages might have long-polling connections
		});
}

/**
 * Wait for page to be fully loaded and ready
 *
 * @param page - Playwright page object
 * @param options - Optional configuration
 */
export async function waitForPageReady(
	page: Page,
	options: {
		timeout?: number;
		waitForNetworkIdle?: boolean;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const waitForNetworkIdle = options.waitForNetworkIdle ?? true;

	// Wait for DOM content to be loaded
	await page.waitForLoadState("domcontentloaded", { timeout });

	// Wait for all resources to be loaded
	await page.waitForLoadState("load", { timeout });

	// Optionally wait for network to be idle
	if (waitForNetworkIdle) {
		await page
			.waitForLoadState("networkidle", {
				timeout: DEFAULT_NETWORK_IDLE_TIMEOUT,
			})
			.catch(() => {
				// Ignore timeout for pages with WebSocket connections
			});
	}

	// Wait for any loading indicators to disappear
	await waitForLoadingComplete(page, { timeout });

	// Small delay to ensure everything is settled
	await page.waitForTimeout(DEFAULT_ANIMATION_WAIT);
}

/**
 * Retry an operation with exponential backoff
 *
 * @param operation - Async function to retry
 * @param maxAttempts - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 */
export async function retryOperation<T>(
	operation: () => Promise<T>,
	maxAttempts: number = MAX_RETRY_ATTEMPTS,
	baseDelay: number = RETRY_BASE_DELAY_MS,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error as Error;

			// Don't wait after the last attempt
			if (attempt < maxAttempts - 1) {
				const delay = baseDelay * 2 ** attempt;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw (
		lastError || new Error(`Operation failed after ${maxAttempts} attempts`)
	);
}

/**
 * Wait for a condition to be true with timeout
 *
 * @param condition - Function that returns a promise resolving to boolean
 * @param options - Optional configuration
 */
export async function waitForCondition(
	condition: () => Promise<boolean>,
	options: {
		timeout?: number;
		interval?: number;
		errorMessage?: string;
	} = {},
): Promise<void> {
	const timeout = options.timeout ?? DEFAULT_ELEMENT_TIMEOUT;
	const interval = options.interval ?? 500;
	const errorMessage =
		options.errorMessage ?? "Condition not met within timeout";

	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		if (await condition()) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(errorMessage);
}

/**
 * Scroll element into view if needed and wait for it to be stable
 *
 * @param locator - Playwright locator for the element
 */
export async function scrollIntoViewIfNeeded(locator: Locator): Promise<void> {
	await locator.scrollIntoViewIfNeeded();

	// Wait for scroll to complete
	await locator.page().waitForTimeout(DEFAULT_ANIMATION_WAIT);
}

/**
 * Check if element is visible without throwing
 *
 * @param locator - Playwright locator for the element
 * @param timeout - Maximum time to wait
 */
export async function isElementVisible(
	locator: Locator,
	timeout: number = 3000,
): Promise<boolean> {
	try {
		await locator.waitFor({ state: "visible", timeout });
		return true;
	} catch {
		return false;
	}
}

/**
 * Get text content safely, returns empty string if element doesn't exist
 *
 * @param locator - Playwright locator for the element
 */
export async function getTextSafely(locator: Locator): Promise<string> {
	try {
		await locator.waitFor({ state: "visible", timeout: 3000 });
		return (await locator.textContent()) || "";
	} catch {
		return "";
	}
}
