import { test as base, Page } from '@playwright/test';
import { AuthPage } from '@/pages/auth.page';
import { MultiplayerPage } from '@/pages/multiplayer.page';
import { GamePage } from '@/pages/game.page';

/**
 * Extended test fixtures with page objects
 */
type TestFixtures = {
	authPage: AuthPage;
	multiplayerPage: MultiplayerPage;
	gamePage: GamePage;
	authenticatedPage: Page;
};

/**
 * Test credentials for different user types
 */
export const testUsers = {
	player1: {
		username: `test_player_1_${Date.now()}`,
		password: 'TestPassword123!'
	},
	player2: {
		username: `test_player_2_${Date.now()}`,
		password: 'TestPassword123!'
	},
	player3: {
		username: `test_player_3_${Date.now()}`,
		password: 'TestPassword123!'
	},
	host: {
		username: `test_host_${Date.now()}`,
		password: 'TestPassword123!'
	}
};

/**
 * Extended test with page object fixtures
 */
export const test = base.extend<TestFixtures>({
	authPage: async ({ page }, use) => {
		const authPage = new AuthPage(page);
		await use(authPage);
	},

	multiplayerPage: async ({ page }, use) => {
		const multiplayerPage = new MultiplayerPage(page);
		await use(multiplayerPage);
	},

	gamePage: async ({ page }, use) => {
		const gamePage = new GamePage(page);
		await use(gamePage);
	},

	/**
	 * Fixture that provides an already authenticated page
	 */
	authenticatedPage: async ({ page }, use) => {
		const authPage = new AuthPage(page);
		
		// Register and login
		await authPage.gotoRegister();
		const username = `test_user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		await authPage.register(username, 'TestPassword123!');
		
		// Verify login was successful
		await page.waitForURL('**/puzzle', { timeout: 10000 });
		
		await use(page);
	}
});

export { expect } from '@playwright/test';
