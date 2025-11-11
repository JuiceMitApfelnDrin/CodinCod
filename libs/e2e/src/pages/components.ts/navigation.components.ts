import { robustClick } from "@/utils/interaction-helpers";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";
import { expect, type Locator, type Page } from "@playwright/test";

export class Navigation {
	readonly page: Page;
	readonly homeLink: Locator;
	readonly loginLink: Locator;
	readonly learnLink: Locator;
	readonly multiplayerLink: Locator;
	readonly puzzlesLink: Locator;
	readonly themeToggle: Locator;

	constructor(page: Page) {
		this.page = page;

		this.homeLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_HOME);
		this.loginLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		this.learnLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LEARN);
		this.multiplayerLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_PLAY);
		this.puzzlesLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_PUZZLES);
		this.themeToggle = page.getByTestId(testIds.NAVIGATION_TOGGLE_THEME);
	}

	async navigateToHome(): Promise<void> {
		await robustClick(this.homeLink);

		expect(this.page.url()).toMatch(frontendUrls.HOME);
	}

	async navigateToLogin(): Promise<void> {
		await robustClick(this.loginLink);

		expect(this.page.url()).toMatch(frontendUrls.LOGIN);
	}

	async navigateToLearn(): Promise<void> {
		await robustClick(this.learnLink);

		expect(this.page.url()).toMatch(frontendUrls.LEARN);
	}

	async navigateToMultiplayer(): Promise<void> {
		await robustClick(this.multiplayerLink);

		expect(this.page.url()).toMatch(frontendUrls.MULTIPLAYER);
	}

	async navigateToPuzzles(): Promise<void> {
		await robustClick(this.puzzlesLink);

		expect(this.page.url()).toMatch(frontendUrls.PUZZLES);
	}

	async toggleTheme(): Promise<void> {
		await robustClick(this.themeToggle);

		expect(this.page.locator("body, html")).toHaveClass(/dark/);
	}
}
