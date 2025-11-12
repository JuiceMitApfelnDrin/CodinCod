import { expect, type Locator, type Page } from "@playwright/test";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Component object model for standings table functionality
 */
export class StandingsTableComponent {
	readonly page: Page;
	readonly standingsTable: Locator;
	readonly playersList: Locator;
	readonly playerRows: Locator;
	readonly codeToggleButton: Locator;
	readonly inviteCodeInput: Locator;

	constructor(page: Page) {
		this.page = page;

		this.standingsTable = page.getByTestId(
			testIds.GAME_COMPONENT_STANDINGS_TABLE,
		);
		this.playersList = page.getByTestId(testIds.MULTIPLAYER_PAGE_PLAYERS_LIST);
		this.playerRows = this.standingsTable.locator(
			'li, [data-testid="standings-table-player-row"]',
		);
		this.codeToggleButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_TOGGLE_INVITE_CODE,
		);
		this.inviteCodeInput = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_INPUT_INVITE_CODE,
		);
	}

	/**
	 * Get all players in the standings table
	 */
	async getPlayers(): Promise<string[]> {
		const players = await this.playerRows.allTextContents();
		return players
			.map((player) => player.trim())
			.filter((player) => player.length > 0);
	}

	/**
	 * Get player count in the standings table
	 */
	async getPlayerCount(): Promise<number> {
		return await this.playerRows.count();
	}

	/**
	 * Check if a specific player is in the standings
	 */
	async hasPlayer(playerName: string): Promise<boolean> {
		const players = await this.getPlayers();
		return players.some((player) => player.includes(playerName));
	}

	/**
	 * Wait for a specific number of players to be in the standings
	 */
	async waitForPlayerCount(
		count: number,
		timeout: number = 10000,
	): Promise<void> {
		await expect
			.poll(async () => await this.getPlayerCount(), { timeout })
			.toBe(count);
	}

	/**
	 * Get player rankings
	 */
	async getPlayerRankings(): Promise<
		{ rank: number; name: string; status?: string }[]
	> {
		const playerElements = await this.playerRows.elementHandles();
		const rankings = [];

		for (const [index, element] of playerElements.entries()) {
			const textContent = await element.textContent();
			if (textContent && textContent.trim().length > 0) {
				rankings.push({
					rank: index + 1,
					name: textContent.trim(),
				});
			}
		}

		return rankings;
	}

	/**
	 * Toggle invite code visibility
	 */
	async toggleInviteCode(): Promise<void> {
		await this.codeToggleButton.click();
	}

	/**
	 * Get the invite code (must be host)
	 */
	async getInviteCode(): Promise<string> {
		// Ensure the invite code input is visible first
		if (!(await this.inviteCodeInput.isVisible())) {
			await this.toggleInviteCode();
		}

		const code = await this.inviteCodeInput.inputValue();

		// Hide the code again after getting it
		if (await this.inviteCodeInput.isVisible()) {
			await this.toggleInviteCode();
		}

		return code;
	}

	/**
	 * Check if standings table is visible
	 */
	async isVisible(): Promise<boolean> {
		return await this.standingsTable.isVisible();
	}
}
