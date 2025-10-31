import { Browser, BrowserContext, Page } from '@playwright/test';

/**
 * Helper class to manage multiple browser contexts for multiplayer tests
 */
export class MultiplayerTestHelper {
	private contexts: Map<string, BrowserContext> = new Map();
	private pages: Map<string, Page> = new Map();

	constructor(private browser: Browser) {}

	/**
	 * Create a new player context
	 */
	async createPlayer(playerName: string): Promise<{ context: BrowserContext; page: Page }> {
		const context = await this.browser.newContext();
		const page = await context.newPage();
		
		this.contexts.set(playerName, context);
		this.pages.set(playerName, page);
		
		return { context, page };
	}

	/**
	 * Get a player's page
	 */
	getPlayerPage(playerName: string): Page | undefined {
		return this.pages.get(playerName);
	}

	/**
	 * Get a player's context
	 */
	getPlayerContext(playerName: string): BrowserContext | undefined {
		return this.contexts.get(playerName);
	}

	/**
	 * Clean up all contexts and pages
	 */
	async cleanup(): Promise<void> {
		for (const [_name, context] of this.contexts) {
			await context.close();
		}
		this.contexts.clear();
		this.pages.clear();
	}

	/**
	 * Get all player names
	 */
	getPlayerNames(): string[] {
		return Array.from(this.pages.keys());
	}

	/**
	 * Get number of players
	 */
	getPlayerCount(): number {
		return this.pages.size;
	}
}

/**
 * Generate unique test username
 */
export function generateTestUsername(prefix: string = 'test'): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Wait for a condition with timeout
 */
export async function waitFor(
	condition: () => Promise<boolean>,
	timeout: number = 10000,
	interval: number = 500
): Promise<boolean> {
	const startTime = Date.now();
	
	while (Date.now() - startTime < timeout) {
		if (await condition()) {
			return true;
		}
		await new Promise(resolve => setTimeout(resolve, interval));
	}
	
	return false;
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<T> {
	let lastError: Error | undefined;
	
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			
			if (i < maxRetries - 1) {
				const delay = baseDelay * Math.pow(2, i);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
	}
	
	throw lastError || new Error('Retry failed');
}
