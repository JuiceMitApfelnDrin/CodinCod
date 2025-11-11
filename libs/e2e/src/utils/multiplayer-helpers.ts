import type { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * Player configuration for multiplayer tests
 */
export interface PlayerConfig {
	name: string;
	username: string;
	email: string;
	password: string;
}

/**
 * Player instance with context and page
 */
export interface Player {
	config: PlayerConfig;
	context: BrowserContext;
	page: Page;
}

/**
 * Multiplayer test manager for coordinating multiple players
 */
export class MultiplayerTestManager {
	private players: Map<string, Player> = new Map();

	constructor(private readonly browser: Browser) {}

	/**
	 * Create a new player with isolated browser context
	 *
	 * @param config - Player configuration
	 */
	async createPlayer(config: PlayerConfig): Promise<Player> {
		// Create isolated browser context
		const context = await this.browser.newContext({
			viewport: { width: 1280, height: 720 },
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			// Ensure each player has isolated storage
			storageState: undefined,
		});

		// Create page
		const page = await context.newPage();

		// Enable console logging for debugging
		page.on("console", (msg) => {
			console.log(`[${config.name}] ${msg.type()}: ${msg.text()}`);
		});

		// Log page errors
		page.on("pageerror", (error) => {
			console.error(`[${config.name}] Page error:`, error);
		});

		// Log WebSocket errors
		page.on("websocket", (ws) => {
			ws.on("socketerror", (error: string) => {
				console.error(`[${config.name}] WebSocket error:`, error);
			});
		});

		const player: Player = {
			config,
			context,
			page,
		};

		this.players.set(config.name, player);

		return player;
	}

	/**
	 * Get player by name
	 */
	getPlayer(name: string): Player | undefined {
		return this.players.get(name);
	}

	/**
	 * Get all players
	 */
	getAllPlayers(): Player[] {
		return Array.from(this.players.values());
	}

	/**
	 * Get player count
	 */
	getPlayerCount(): number {
		return this.players.size;
	}

	/**
	 * Close a specific player's context
	 */
	async closePlayer(name: string): Promise<void> {
		const player = this.players.get(name);
		if (player) {
			await player.context.close();
			this.players.delete(name);
		}
	}

	/**
	 * Close all player contexts and cleanup
	 */
	async cleanup(): Promise<void> {
		for (const [name, player] of this.players) {
			try {
				await player.context.close();
			} catch (error) {
				console.error(`Error closing context for ${name}:`, error);
			}
		}
		this.players.clear();
	}

	/**
	 * Execute action for all players in parallel
	 */
	async forAllPlayers<T>(action: (player: Player) => Promise<T>): Promise<T[]> {
		const players = Array.from(this.players.values());
		return await Promise.all(players.map(action));
	}

	/**
	 * Execute action for each player sequentially
	 */
	async forEachPlayer<T>(action: (player: Player) => Promise<T>): Promise<T[]> {
		const results: T[] = [];
		for (const player of this.players.values()) {
			results.push(await action(player));
		}
		return results;
	}

	/**
	 * Wait for all players to meet a condition
	 */
	async waitForAllPlayers(
		condition: (player: Player) => Promise<boolean>,
		timeout: number = 30000,
	): Promise<void> {
		const startTime = Date.now();
		const players = Array.from(this.players.values());

		while (Date.now() - startTime < timeout) {
			const results = await Promise.all(
				players.map((player) => condition(player)),
			);

			if (results.every((result) => result === true)) {
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		throw new Error("Timeout waiting for all players to meet condition");
	}
}

/**
 * Generate unique test credentials
 * Note: Frontend has username max length of 20 characters
 * Uses high-precision timestamp + random to ensure uniqueness even in parallel tests
 */
export function generatePlayerConfig(
	name: string,
	index?: number,
): PlayerConfig {
	// Create highly unique suffix using microsecond precision
	const microTime = (Date.now() * 1000 + performance.now())
		.toString(36)
		.slice(-6);
	const random = Math.random().toString(36).substring(2, 5);
	const suffix = `${microTime}${random}`;

	// Ensure username is max 20 chars (t_ = 2, suffix = 9, leaves 9 for name/index)
	const prefix = index !== undefined ? `${name}${index}` : name;
	const maxPrefixLength = 20 - 2 - suffix.length - 1; // -1 for underscore
	const truncatedPrefix = prefix.substring(0, maxPrefixLength);

	return {
		name,
		username: `t_${truncatedPrefix}_${suffix}`,
		email: `t_${truncatedPrefix}_${suffix}@test.local`,
		password: "TestPassword123!",
	};
}

/**
 * Generate multiple player configs
 */
export function generatePlayerConfigs(
	count: number,
	prefix: string = "player",
): PlayerConfig[] {
	return Array.from({ length: count }, (_, i) =>
		generatePlayerConfig(`${prefix}${i + 1}`, i + 1),
	);
}
