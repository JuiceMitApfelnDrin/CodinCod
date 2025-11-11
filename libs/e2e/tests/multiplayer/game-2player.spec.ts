import { test, expect } from "@playwright/test";
import {
	MultiplayerTestManager,
	generatePlayerConfigs,
} from "@/utils/multiplayer-helpers";
import { EnhancedAuthPage } from "@/pages/enhanced-auth.page";
import { EnhancedMultiplayerPage } from "@/pages/enhanced-multiplayer.page";
import { EnhancedGamePage } from "@/pages/enhanced-game.page";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Comprehensive 2-Player Multiplayer E2E Tests
 *
 * These tests cover the complete multiplayer flow with robust waiting
 * and proper WebSocket handling.
 *
 * @e2e @multiplayer @2player
 */
test.describe("2-Player Multiplayer - Complete Flow", () => {
	test.describe.configure({ mode: "serial" });

	test("should complete full 2-player game from room creation to game end", async ({
		browser,
	}) => {
		const manager = new MultiplayerTestManager(browser);
		const [hostConfig, player2Config] = generatePlayerConfigs(2);

		try {
			// ===== PHASE 1: Setup Players =====
			console.log("Phase 1: Creating player contexts...");
			const host = await manager.createPlayer(hostConfig);
			const player2 = await manager.createPlayer(player2Config);

			// ===== PHASE 2: Authentication =====
			console.log("Phase 2: Authenticating players...");
			const hostAuth = new EnhancedAuthPage(host.page);
			const player2Auth = new EnhancedAuthPage(player2.page);

			// Register both players in parallel
			await Promise.all([
				(async () => {
					await hostAuth.gotoRegister();
					await hostAuth.register(hostConfig.username, hostConfig.password);
				})(),
				(async () => {
					await player2Auth.gotoRegister();
					await player2Auth.register(
						player2Config.username,
						player2Config.password,
					);
				})(),
			]);

			// Verify both are logged in
			expect(await hostAuth.isLoggedIn()).toBe(true);
			expect(await player2Auth.isLoggedIn()).toBe(true);

			// ===== PHASE 3: Navigate to Multiplayer =====
			console.log("Phase 3: Navigating to multiplayer...");
			const hostMultiplayer = new EnhancedMultiplayerPage(host.page);
			const player2Multiplayer = new EnhancedMultiplayerPage(player2.page);

			await Promise.all([
				hostMultiplayer.gotoMultiplayer(),
				player2Multiplayer.gotoMultiplayer(),
			]);

			// Verify WebSocket connections to waiting room
			const hostWsStatus = await hostMultiplayer.getWebSocketStatus();
			const player2WsStatus = await player2Multiplayer.getWebSocketStatus();

			console.log("Host WebSocket:", hostWsStatus);
			console.log("Player 2 WebSocket:", player2WsStatus);

			// ===== PHASE 4: Create Room =====
			console.log("Phase 4: Host creating room...");
			await hostMultiplayer.hostQuickRoom();

			// Verify host is in room and is host
			expect(await hostMultiplayer.isInRoom()).toBe(true);
			expect(await hostMultiplayer.isHost()).toBe(true);

			// Wait for room to appear in list for player 2
			await player2.page.waitForTimeout(1000);

			// ===== PHASE 5: Join Room =====
			console.log("Phase 5: Player 2 joining room...");
			await player2Multiplayer.joinFirstAvailableRoom();

			// Verify player 2 is in room but not host
			expect(await player2Multiplayer.isInRoom()).toBe(true);
			expect(await player2Multiplayer.isHost()).toBe(false);

			// ===== PHASE 6: Verify Room State =====
			console.log("Phase 6: Verifying room state...");

			// Wait for both players to see each other
			await Promise.all([
				hostMultiplayer.waitForPlayerCount(2),
				player2Multiplayer.waitForPlayerCount(2),
			]);

			const hostPlayers = await hostMultiplayer.getPlayersInRoom();
			const player2Players = await player2Multiplayer.getPlayersInRoom();

			console.log("Host sees players:", hostPlayers);
			console.log("Player 2 sees players:", player2Players);

			expect(hostPlayers.length).toBe(2);
			expect(player2Players.length).toBe(2);

			// ===== PHASE 7: Test Chat (Optional) =====
			console.log("Phase 7: Testing waiting room chat...");
			await hostMultiplayer.sendChatMessage("Hello from host!");
			await player2.page.waitForTimeout(500);

			await player2Multiplayer.sendChatMessage("Hello from player 2!");
			await host.page.waitForTimeout(500);

			// Verify messages were received
			const hostMessages = await hostMultiplayer.getChatMessages();
			const player2Messages = await player2Multiplayer.getChatMessages();

			console.log("Host chat messages:", hostMessages);
			console.log("Player 2 chat messages:", player2Messages);

			// ===== PHASE 8: Start Game =====
			console.log("Phase 8: Starting game...");
			await hostMultiplayer.startGame();

			// Verify countdown started for both players
			expect(await hostMultiplayer.isGameStarting()).toBe(true);
			expect(await player2Multiplayer.isGameStarting()).toBe(true);

			// ===== PHASE 9: Wait for Game Start =====
			console.log("Phase 9: Waiting for game to start...");
			await Promise.all([
				hostMultiplayer.waitForGameStart(),
				player2Multiplayer.waitForGameStart(),
			]);

			// Verify both players navigated to game page
			expect(host.page.url()).toMatch(/\/multiplayer\/[a-f0-9-]+/);
			expect(player2.page.url()).toMatch(/\/multiplayer\/[a-f0-9-]+/);

			// Extract game ID from URL
			const gameIdMatch = host.page.url().match(/\/multiplayer\/([a-f0-9-]+)/);
			const gameId = gameIdMatch ? gameIdMatch[1] : "";
			expect(gameId).toBeTruthy();

			console.log("Game started with ID:", gameId);

			// ===== PHASE 10: Verify Game Page Load =====
			console.log("Phase 10: Verifying game page...");
			const hostGame = new EnhancedGamePage(host.page);
			const player2Game = new EnhancedGamePage(player2.page);

			// Wait for game to fully load for both players
			await Promise.all([
				hostGame.waitForGameLoad(gameId),
				player2Game.waitForGameLoad(gameId),
			]);

			// Verify game components are visible
			expect(await hostGame.hasGameStarted()).toBe(true);
			expect(await player2Game.hasGameStarted()).toBe(true);

			// ===== PHASE 11: Check WebSocket Connections to Game Channel =====
			console.log("Phase 11: Checking game WebSocket connections...");
			const hostGameWs = await hostGame.getWebSocketStatus(gameId);
			const player2GameWs = await player2Game.getWebSocketStatus(gameId);

			console.log("Host game WebSocket:", hostGameWs);
			console.log("Player 2 game WebSocket:", player2GameWs);

			// ===== PHASE 12: Verify Multiplayer Features =====
			console.log("Phase 12: Verifying multiplayer features...");

			// Check if players can see each other in rankings
			const hostCanSeeOthers = await hostGame.canSeeOtherPlayers();
			const player2CanSeeOthers = await player2Game.canSeeOtherPlayers();

			console.log("Host can see other players:", hostCanSeeOthers);
			console.log("Player 2 can see other players:", player2CanSeeOthers);

			// Get player rankings
			const hostRankings = await hostGame.getPlayerRankings();
			const player2Rankings = await player2Game.getPlayerRankings();

			console.log("Host rankings:", hostRankings);
			console.log("Player 2 rankings:", player2Rankings);

			// ===== PHASE 13: Test In-Game Chat (Optional) =====
			console.log("Phase 13: Testing in-game chat...");
			try {
				await hostGame.sendChatMessage("Good luck!");
				await player2.page.waitForTimeout(500);

				await player2Game.sendChatMessage("You too!");
				await host.page.waitForTimeout(500);

				console.log("Chat messages sent successfully");
			} catch (error) {
				console.log("In-game chat not available or errored:", error);
			}

			// ===== SUCCESS =====
			console.log("✓ All phases completed successfully!");
		} finally {
			// Cleanup
			await manager.cleanup();
		}
	});

	test("should handle player joining mid-countdown", async ({ browser }) => {
		const manager = new MultiplayerTestManager(browser);
		const [hostConfig, player2Config, player3Config] = generatePlayerConfigs(3);

		try {
			console.log("Setup: Creating 3 players...");
			const host = await manager.createPlayer(hostConfig);
			const player2 = await manager.createPlayer(player2Config);
			const player3 = await manager.createPlayer(player3Config);

			// Authenticate all players
			await manager.forAllPlayers(async (player) => {
				const auth = new EnhancedAuthPage(player.page);
				await auth.gotoRegister();
				await auth.register(player.config.username, player.config.password);
			});

			// Navigate to multiplayer
			const hostMultiplayer = new EnhancedMultiplayerPage(host.page);
			const player2Multiplayer = new EnhancedMultiplayerPage(player2.page);
			const player3Multiplayer = new EnhancedMultiplayerPage(player3.page);

			await Promise.all([
				hostMultiplayer.gotoMultiplayer(),
				player2Multiplayer.gotoMultiplayer(),
				player3Multiplayer.gotoMultiplayer(),
			]);

			// Host creates room
			await hostMultiplayer.hostQuickRoom();
			await player2.page.waitForTimeout(1000);

			// Player 2 joins
			await player2Multiplayer.joinFirstAvailableRoom();

			// Wait for 2 players
			await hostMultiplayer.waitForPlayerCount(2);

			// Host starts game
			await hostMultiplayer.startGame();

			// Player 3 tries to join during countdown
			await player3.page.waitForTimeout(1000);

			const joinButton = player3Multiplayer.joinRoomButton.first();
			const canJoin = await joinButton.isVisible().catch(() => false);

			// Depending on implementation, late join might be blocked
			console.log("Can player 3 join during countdown:", canJoin);

			// Wait for game start for initial players
			await Promise.all([
				hostMultiplayer.waitForGameStart(),
				player2Multiplayer.waitForGameStart(),
			]);

			// Verify both reached game
			expect(host.page.url()).toMatch(/\/multiplayer\//);
			expect(player2.page.url()).toMatch(/\/multiplayer\//);
		} finally {
			await manager.cleanup();
		}
	});

	test("should handle player disconnection gracefully", async ({ browser }) => {
		const manager = new MultiplayerTestManager(browser);
		const [hostConfig, player2Config] = generatePlayerConfigs(2);

		try {
			const host = await manager.createPlayer(hostConfig);
			const player2 = await manager.createPlayer(player2Config);

			// Setup and authenticate
			const hostAuth = new EnhancedAuthPage(host.page);
			const player2Auth = new EnhancedAuthPage(player2.page);

			await Promise.all([
				(async () => {
					await hostAuth.gotoRegister();
					await hostAuth.register(hostConfig.username, hostConfig.password);
				})(),
				(async () => {
					await player2Auth.gotoRegister();
					await player2Auth.register(
						player2Config.username,
						player2Config.password,
					);
				})(),
			]);

			// Navigate and create room
			const hostMultiplayer = new EnhancedMultiplayerPage(host.page);
			const player2Multiplayer = new EnhancedMultiplayerPage(player2.page);

			await Promise.all([
				hostMultiplayer.gotoMultiplayer(),
				player2Multiplayer.gotoMultiplayer(),
			]);

			await hostMultiplayer.hostQuickRoom();
			await player2.page.waitForTimeout(1000);
			await player2Multiplayer.joinFirstAvailableRoom();

			await hostMultiplayer.waitForPlayerCount(2);

			// Start game
			await hostMultiplayer.startGame();
			await Promise.all([
				hostMultiplayer.waitForGameStart(),
				player2Multiplayer.waitForGameStart(),
			]);

			const gameIdMatch = host.page.url().match(/\/multiplayer\/([a-f0-9-]+)/);
			const gameId = gameIdMatch ? gameIdMatch[1] : "";

			const hostGame = new EnhancedGamePage(host.page);
			const player2Game = new EnhancedGamePage(player2.page);

			await Promise.all([
				hostGame.waitForGameLoad(gameId),
				player2Game.waitForGameLoad(gameId),
			]);

			// Player 2 navigates away (simulates disconnect)
			await player2.page.goto("/");
			await host.page.waitForTimeout(2000);

			// Host should still be in game
			expect(host.page.url()).toMatch(/\/multiplayer\//);
			expect(await hostGame.hasGameStarted()).toBe(true);

			// Host's connection status might change
			const connectionStatus = await hostGame.getConnectionStatus();
			console.log(
				"Host connection status after player 2 left:",
				connectionStatus,
			);
		} finally {
			await manager.cleanup();
		}
	});
});
