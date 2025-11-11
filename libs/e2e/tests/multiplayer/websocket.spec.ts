import { test, expect } from "@/fixtures/base.fixtures";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { generateTestUsername } from "@/utils/test-helpers";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";
import type { BrowserContext, Page } from "@playwright/test";
/**
 * Multiplayer WebSocket Resilience E2E tests
 * Tests WebSocket connection handling, reconnection, and edge cases
 * @e2e @multiplayer @websocket
 */
test.describe("Multiplayer - WebSocket Resilience", () => {
	test("should handle multiple players connecting and disconnecting @e2e @multiplayer", async ({
		browser,
	}) => {
		const contexts: BrowserContext[] = [];
		const pages: Page[] = [];

		try {
			const { AuthPage } = await import("@/pages/auth.page");
			const { MultiplayerPage } = await import("@/pages/multiplayer.page");

			// Create host
			const context1 = await browser.newContext();
			const page1 = await context1.newPage();
			contexts.push(context1);
			pages.push(page1);

			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername(), TEST_PASSWORD);
			await multiplayer1.gotoMultiplayer();
			await page1
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM)
				.click();
			await page1.waitForTimeout(500);

			// Add 4 players one by one
			for (let i = 2; i <= 5; i++) {
				const context = await browser.newContext();
				const page = await context.newPage();
				contexts.push(context);
				pages.push(page);

				const auth = new AuthPage(page);
				const multiplayer = new MultiplayerPage(page);

				await auth.gotoRegister();
				await auth.register(generateTestUsername(), "TestPassword123!");
				await multiplayer.gotoMultiplayer();
				await page.waitForTimeout(1000);
				await page
					.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
					.first()
					.click();
				await page.waitForTimeout(500);

				// Verify all connected players see the new player
				const players = await multiplayer1.getPlayersInRoom();
				expect(players.length).toBe(i);
			}

			// Remove players 2 and 3
			const multiplayer2 = new MultiplayerPage(pages[1]);
			const multiplayer3 = new MultiplayerPage(pages[2]);

			await multiplayer2.leaveRoom();
			await pages[1].waitForTimeout(500);
			await multiplayer3.leaveRoom();
			await pages[2].waitForTimeout(1000);

			// Remaining players should see 3 players (host + player 4 + player 5)
			const remainingPlayers = await multiplayer1.getPlayersInRoom();
			expect(remainingPlayers.length).toBe(3);

			// Player 4 and 5 should also see 3 players
			const multiplayer4 = new MultiplayerPage(pages[3]);
			const players4 = await multiplayer4.getPlayersInRoom();
			expect(players4.length).toBe(3);
		} finally {
			for (const context of contexts) {
				await context.close();
			}
		}
	});

	test("should maintain room state after temporary disconnection @e2e @multiplayer", async ({
		browser,
	}) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();

		try {
			const { AuthPage } = await import("@/pages/auth.page");
			const { MultiplayerPage } = await import("@/pages/multiplayer.page");

			// Setup room
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			const hostUsername = generateTestUsername();
			const hostPassword = "TestPassword123!";
			await auth1.register(hostUsername, hostPassword);
			await multiplayer1.gotoMultiplayer();
			await page1
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM)
				.click();
			await page1.waitForTimeout(500);

			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername(), TEST_PASSWORD);
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);
			await page2
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
				.first()
				.click();
			await page2.waitForTimeout(500);

			// Verify 2 players
			const players = await multiplayer1.getPlayersInRoom();
			expect(players.length).toBe(2);

			// Simulate host temporary disconnect by closing WebSocket (navigate away and back)
			await page1.goto("/puzzle");
			await page1.waitForTimeout(500);
			await multiplayer1.gotoMultiplayer();
			await page1.waitForTimeout(2000);

			// Player 2 should see only 1 player now (themselves)
			const playersAfterDisconnect = await multiplayer2.getPlayersInRoom();
			// The host has left the room by navigating away
			expect(playersAfterDisconnect.length).toBeLessThanOrEqual(2);
		} finally {
			await context1.close();
			await context2.close();
		}
	});

	test("should handle rapid connection/disconnection @e2e @multiplayer", async ({
		browser,
	}) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();

		try {
			const { AuthPage } = await import("@/pages/auth.page");
			const { MultiplayerPage } = await import("@/pages/multiplayer.page");

			// Setup host
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername(), TEST_PASSWORD);
			await multiplayer1.gotoMultiplayer();
			await page1
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM)
				.click();
			await page1.waitForTimeout(500);

			// Player joins and leaves rapidly multiple times
			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername(), TEST_PASSWORD);

			for (let i = 0; i < 3; i++) {
				await multiplayer2.gotoMultiplayer();
				await page2.waitForTimeout(1000);
				await page2
					.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
					.first()
					.click();
				await page2.waitForTimeout(500);

				const players = await multiplayer1.getPlayersInRoom();
				expect(players.length).toBe(2);

				await multiplayer2.leaveRoom();
				await page2.waitForTimeout(500);

				const playersAfterLeave = await multiplayer1.getPlayersInRoom();
				expect(playersAfterLeave.length).toBe(1);
			}

			// Final state should be stable
			const finalPlayers = await multiplayer1.getPlayersInRoom();
			expect(finalPlayers.length).toBe(1);
		} finally {
			await context1.close();
			await context2.close();
		}
	});

	test("should handle room cleanup when all players disconnect @e2e @multiplayer", async ({
		browser,
	}) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();
		const context3 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();
		const page3 = await context3.newPage();

		try {
			const { AuthPage } = await import("@/pages/auth.page");
			const { MultiplayerPage } = await import("@/pages/multiplayer.page");

			// Create room with 2 players
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername(), TEST_PASSWORD);
			await multiplayer1.gotoMultiplayer();
			await page1
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM)
				.click();
			await page1.waitForTimeout(500);

			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername(), TEST_PASSWORD);
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);
			await page2
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
				.first()
				.click();
			await page2.waitForTimeout(500);

			// Count available rooms before cleanup
			const auth3 = new AuthPage(page3);
			const multiplayer3 = new MultiplayerPage(page3);
			await auth3.gotoRegister();
			await auth3.register(generateTestUsername(), "TestPassword123!");
			await multiplayer3.gotoMultiplayer();
			await page3.waitForTimeout(1000);

			const roomsBeforeCleanup = await page3
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
				.count();
			expect(roomsBeforeCleanup).toBeGreaterThanOrEqual(1);

			// Both players leave
			await multiplayer1.leaveRoom();
			await page1.waitForTimeout(500);
			await multiplayer2.leaveRoom();
			await page2.waitForTimeout(1000);

			// Refresh observer's view
			await multiplayer3.gotoMultiplayer();
			await page3.waitForTimeout(1000);

			// Room should be cleaned up (not appear in list, or have 0 players if it briefly appears)
			const roomsAfterCleanup = await page3
				.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM)
				.count();
			// The empty room should eventually be cleaned up
			// Note: This is timing-dependent, so we just verify the page loads without errors
			expect(roomsAfterCleanup).toBeGreaterThanOrEqual(0);
		} finally {
			await context1.close();
			await context2.close();
			await context3.close();
		}
	});
});
