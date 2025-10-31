import { test, expect } from '@/fixtures/base.fixtures';
import { generateTestUsername } from '@/utils/test-helpers';
import { testIds } from 'types';

/**
 * Multiplayer Late Join E2E tests
 * Tests what happens when players join after game has started
 * @e2e @multiplayer @latejoin
 */
test.describe('Multiplayer - Late Join Scenarios', () => {
	test('should allow joining during countdown @e2e @multiplayer', async ({ browser }) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();
		const context3 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();
		const page3 = await context3.newPage();

		try {
			const { AuthPage } = await import('@/pages/auth.page');
			const { MultiplayerPage } = await import('@/pages/multiplayer.page');

			// Host and player 1 setup
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername('host'), 'TestPassword123!');
			await multiplayer1.gotoMultiplayer();
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
			await page1.waitForTimeout(500);

			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername('player2'), 'TestPassword123!');
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);
			await page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page2.waitForTimeout(500);

			// Start countdown
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM).click();
			await page1.waitForTimeout(1000);

			// Verify countdown is active
			expect(await multiplayer1.isGameStarting()).toBe(true);
			expect(await multiplayer2.isGameStarting()).toBe(true);

			// Player 3 joins during countdown
			const auth3 = new AuthPage(page3);
			const multiplayer3 = new MultiplayerPage(page3);
			await auth3.gotoRegister();
			await auth3.register(generateTestUsername('player3'), 'TestPassword123!');
			await multiplayer3.gotoMultiplayer();
			await page3.waitForTimeout(1000);
			await page3.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page3.waitForTimeout(1000);

			// Player 3 should also be in countdown
			expect(await multiplayer3.isInRoom()).toBe(true);
			expect(await multiplayer3.isGameStarting()).toBe(true);

			// All three should have 3 players listed
			const players1 = await multiplayer1.getPlayersInRoom();
			const players2 = await multiplayer2.getPlayersInRoom();
			const players3 = await multiplayer3.getPlayersInRoom();

			expect(players1.length).toBe(3);
			expect(players2.length).toBe(3);
			expect(players3.length).toBe(3);

			// Wait for game start
			await Promise.all([
				multiplayer1.waitForGameStart(),
				multiplayer2.waitForGameStart(),
				multiplayer3.waitForGameStart()
			]);

			// All should navigate to game
			await expect(page1).toHaveURL(/.*multiplayer\/[a-f0-9]+/);
			await expect(page2).toHaveURL(/.*multiplayer\/[a-f0-9]+/);
			await expect(page3).toHaveURL(/.*multiplayer\/[a-f0-9]+/);

		} finally {
			await context1.close();
			await context2.close();
			await context3.close();
		}
	});

	test('should handle player leaving during countdown @e2e @multiplayer', async ({ browser }) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();
		const context3 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();
		const page3 = await context3.newPage();

		try {
			const { AuthPage } = await import('@/pages/auth.page');
			const { MultiplayerPage } = await import('@/pages/multiplayer.page');

			// Setup 3 players
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername('host'), 'TestPassword123!');
			await multiplayer1.gotoMultiplayer();
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
			await page1.waitForTimeout(500);

			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername('player2'), 'TestPassword123!');
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);
			await page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page2.waitForTimeout(500);

			const auth3 = new AuthPage(page3);
			const multiplayer3 = new MultiplayerPage(page3);
			await auth3.gotoRegister();
			await auth3.register(generateTestUsername('player3'), 'TestPassword123!');
			await multiplayer3.gotoMultiplayer();
			await page3.waitForTimeout(1000);
			await page3.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page3.waitForTimeout(500);

			// Start countdown
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM).click();
			await page1.waitForTimeout(1000);

			// Player 3 leaves during countdown
			await multiplayer3.leaveRoom();
			await page3.waitForTimeout(1000);

			// Remaining players should see updated player count
			const players1 = await multiplayer1.getPlayersInRoom();
			const players2 = await multiplayer2.getPlayersInRoom();

			expect(players1.length).toBe(2);
			expect(players2.length).toBe(2);

			// Game should still start for remaining players
			await Promise.all([
				multiplayer1.waitForGameStart(),
				multiplayer2.waitForGameStart()
			]);

			await expect(page1).toHaveURL(/.*multiplayer\/[a-f0-9]+/);
			await expect(page2).toHaveURL(/.*multiplayer\/[a-f0-9]+/);

		} finally {
			await context1.close();
			await context2.close();
			await context3.close();
		}
	});

	test('should handle host leaving during countdown @e2e @multiplayer', async ({ browser }) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();

		try {
			const { AuthPage } = await import('@/pages/auth.page');
			const { MultiplayerPage } = await import('@/pages/multiplayer.page');

			// Setup host and player
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername('host'), 'TestPassword123!');
			await multiplayer1.gotoMultiplayer();
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
			await page1.waitForTimeout(500);

			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername('player'), 'TestPassword123!');
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);
			await page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page2.waitForTimeout(500);

			// Start countdown
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM).click();
			await page1.waitForTimeout(1000);

			// Host leaves during countdown
			await multiplayer1.leaveRoom();
			await page1.waitForTimeout(1000);

			// Player 2 should become the new host (earliest join time after original host)
			const isNowHost = await multiplayer2.isHost();
			expect(isNowHost).toBe(true);

			// Player 2 should be able to start the game
			const startButton = page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM);
			await expect(startButton).toBeVisible();

		} finally {
			await context1.close();
			await context2.close();
		}
	});
});
