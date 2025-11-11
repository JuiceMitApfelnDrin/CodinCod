import { test, expect } from "@playwright/test";
import { EnhancedAuthPage } from "@/pages/enhanced-auth.page";
import { EnhancedMultiplayerPage } from "@/pages/enhanced-multiplayer.page";
import { generateTestUsername } from "@/utils/test-helpers";
import { TEST_PASSWORD } from "@/utils/test-constants";

test.describe("Multiplayer Room Lifecycle", () => {
	test.describe.configure({ mode: "parallel" });

	test("should create a room and see self as host", async ({ page }) => {
		const authPage = new EnhancedAuthPage(page);
		const multiplayerPage = new EnhancedMultiplayerPage(page);

		// Register and login (username max 20 chars)
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);
		await page.waitForURL("**/puzzles", { timeout: 10000 });

		// Navigate to multiplayer
		await multiplayerPage.gotoMultiplayer();

		// Host a room
		await multiplayerPage.hostQuickRoom();

		// Verify we're in a room
		expect(await multiplayerPage.isInRoom()).toBe(true);

		// Verify we're the host
		expect(await multiplayerPage.isHost()).toBe(true);

		// Verify we see ourselves in the player list
		const players = await multiplayerPage.getPlayersInRoom();
		expect(players.length).toBe(1);
		expect(players[0]).toContain(username);
	});

	test("should allow host to leave room and delete it", async ({ page }) => {
		const authPage = new EnhancedAuthPage(page);
		const multiplayerPage = new EnhancedMultiplayerPage(page);

		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);
		await page.waitForURL("**/puzzles", { timeout: 10000 });

		// Navigate to multiplayer and host
		await multiplayerPage.gotoMultiplayer();
		await multiplayerPage.hostQuickRoom();

		// Verify we're in room
		expect(await multiplayerPage.isInRoom()).toBe(true);

		// Leave room
		await multiplayerPage.leaveRoom();

		// Verify we left the room
		expect(await multiplayerPage.isInRoom()).toBe(false);

		// Verify we can host again (host button should be visible)
		await expect(multiplayerPage.hostRoomButton).toBeVisible();
	});

	test("should allow player to join and leave room", async ({ browser }) => {
		const hostContext = await browser.newContext();
		const playerContext = await browser.newContext();

		const hostPage = await hostContext.newPage();
		const playerPage = await playerContext.newPage();

		try {
			const hostAuth = new EnhancedAuthPage(hostPage);
			const hostMultiplayer = new EnhancedMultiplayerPage(hostPage);
			const playerAuth = new EnhancedAuthPage(playerPage);
			const playerMultiplayer = new EnhancedMultiplayerPage(playerPage);

			// Host creates account and room
			await hostAuth.gotoRegister();
			const hostUsername = generateTestUsername();
			await hostAuth.register(hostUsername, TEST_PASSWORD);
			await hostPage.waitForURL("**/puzzles", { timeout: 10000 });

			await hostMultiplayer.gotoMultiplayer();
			await hostMultiplayer.hostQuickRoom();

			// Player creates account
			await playerAuth.gotoRegister();
			const playerUsername = generateTestUsername();
			await playerAuth.register(playerUsername, TEST_PASSWORD);
			await playerPage.waitForURL("**/puzzles", { timeout: 10000 });

			// Player joins the room
			await playerMultiplayer.gotoMultiplayer();
			await playerMultiplayer.joinFirstAvailableRoom();

			// Wait for player to appear in host's view
			await hostMultiplayer.waitForPlayerCount(2, 10000);

			// Verify both see 2 players
			expect(await hostMultiplayer.getPlayerCount()).toBe(2);
			expect(await playerMultiplayer.getPlayerCount()).toBe(2);

			// Player leaves
			await playerMultiplayer.leaveRoom();

			// Verify player left
			expect(await playerMultiplayer.isInRoom()).toBe(false);

			// Wait for host to see update
			await hostMultiplayer.waitForPlayerCount(1, 10000);
			expect(await hostMultiplayer.getPlayerCount()).toBe(1);
		} finally {
			await hostContext.close();
			await playerContext.close();
		}
	});

	test("should delete room when host leaves with player inside", async ({
		browser,
	}) => {
		const hostContext = await browser.newContext();
		const playerContext = await browser.newContext();

		const hostPage = await hostContext.newPage();
		const playerPage = await playerContext.newPage();

		try {
			const hostAuth = new EnhancedAuthPage(hostPage);
			const hostMultiplayer = new EnhancedMultiplayerPage(hostPage);
			const playerAuth = new EnhancedAuthPage(playerPage);
			const playerMultiplayer = new EnhancedMultiplayerPage(playerPage);

			// Host creates account and room
			await hostAuth.gotoRegister();
			const hostUsername = generateTestUsername();
			await hostAuth.register(hostUsername, TEST_PASSWORD);
			await hostPage.waitForURL("**/puzzles", { timeout: 10000 });

			await hostMultiplayer.gotoMultiplayer();
			await hostMultiplayer.hostQuickRoom();

			// Player creates account and joins
			await playerAuth.gotoRegister();
			const playerUsername = generateTestUsername();
			await playerAuth.register(playerUsername, TEST_PASSWORD);
			await playerPage.waitForURL("**/puzzles", { timeout: 10000 });

			await playerMultiplayer.gotoMultiplayer();
			await playerMultiplayer.joinFirstAvailableRoom();

			// Wait for both to be in room
			await hostMultiplayer.waitForPlayerCount(2, 10000);

			// Host leaves
			await hostMultiplayer.leaveRoom();

			// Player should be kicked out of room (room deleted)
			await expect
				.poll(async () => await playerMultiplayer.isInRoom(), {
					timeout: 10000,
					intervals: [1000, 2000, 3000],
				})
				.toBe(false);
		} finally {
			await hostContext.close();
			await playerContext.close();
		}
	});

	test("should allow player to rejoin after leaving", async ({ browser }) => {
		const hostContext = await browser.newContext();
		const playerContext = await browser.newContext();

		const hostPage = await hostContext.newPage();
		const playerPage = await playerContext.newPage();

		try {
			const hostAuth = new EnhancedAuthPage(hostPage);
			const hostMultiplayer = new EnhancedMultiplayerPage(hostPage);
			const playerAuth = new EnhancedAuthPage(playerPage);
			const playerMultiplayer = new EnhancedMultiplayerPage(playerPage);

			// Setup host and player
			await hostAuth.gotoRegister();
			await hostAuth.register(generateTestUsername(), TEST_PASSWORD);
			await hostPage.waitForURL("**/puzzles", { timeout: 10000 });
			await hostMultiplayer.gotoMultiplayer();
			await hostMultiplayer.hostQuickRoom();

			await playerAuth.gotoRegister();
			await playerAuth.register(generateTestUsername(), TEST_PASSWORD);
			await playerPage.waitForURL("**/puzzles", { timeout: 10000 });

			// Player joins
			await playerMultiplayer.gotoMultiplayer();
			await playerMultiplayer.joinFirstAvailableRoom();
			await hostMultiplayer.waitForPlayerCount(2, 10000);

			// Player leaves
			await playerMultiplayer.leaveRoom();
			await hostMultiplayer.waitForPlayerCount(1, 10000);

			// Player rejoins
			await playerMultiplayer.joinFirstAvailableRoom();

			// Verify rejoined
			await hostMultiplayer.waitForPlayerCount(2, 10000);
			expect(await playerMultiplayer.getPlayerCount()).toBe(2);
		} finally {
			await hostContext.close();
			await playerContext.close();
		}
	});
});
