import { Locator, Page } from "@playwright/test";
import { testIds } from "../../../src/lib/config/test-ids";
import { improvedClick } from "../improved-click";
import { pageChanged } from "../page-changed";
import { frontendUrls } from "types";

export class NavigationComponent {
	page: Page;

	// central navigation
	playAnchor: Locator;
	homeAnchor: Locator;
	puzzlesAnchor: Locator;
	learnAnchor: Locator;

	// side actions
	openMenuButton: Locator;
	loginAnchor: Locator;
	themeToggle: Locator;

	// navigation menu
	settingsAnchor: Locator;
	profileAnchor: Locator;
	logoutAnchor: Locator;

	constructor(page: Page) {
		this.page = page;

		this.playAnchor = page.getByTestId(testIds.NAVIGATION_ANCHOR_PLAY);
		this.homeAnchor = page.getByTestId(testIds.NAVIGATION_ANCHOR_HOME);
		this.puzzlesAnchor = page.getByTestId(testIds.NAVIGATION_ANCHOR_PUZZLES);
		this.learnAnchor = page.getByTestId(testIds.NAVIGATION_ANCHOR_LEARN);
		this.openMenuButton = page.getByTestId(testIds.NAVIGATION_MENU_BUTTON_OPEN);
		this.loginAnchor = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		this.themeToggle = page.getByTestId(testIds.NAVIGATION_TOGGLE_THEME);
		this.logoutAnchor = page.getByTestId(testIds.NAVIGATION_MENU_ANCHOR_LOGOUT);
		this.profileAnchor = page.getByTestId(testIds.NAVIGATION_MENU_ANCHOR_PROFILE);
		this.settingsAnchor = page.getByTestId(testIds.NAVIGATION_MENU_ANCHOR_SETTINGS);
	}

	async gotoPlay() {
		await improvedClick(this.playAnchor);
		await pageChanged(this.page, frontendUrls.MULTIPLAYER);
	}

	async gotoPuzzles() {
		await improvedClick(this.puzzlesAnchor);
		await pageChanged(this.page, frontendUrls.PUZZLES);
	}

	async gotoLearn() {
		await improvedClick(this.learnAnchor);
		await pageChanged(this.page, frontendUrls.LEARN);
	}

	async gotoLogin() {
		await improvedClick(this.loginAnchor);
		await pageChanged(this.page, frontendUrls.LOGIN);
	}

	async gotoHome() {
		await improvedClick(this.homeAnchor);
		await pageChanged(this.page, frontendUrls.ROOT);
	}

	async clickNavigationMenu() {
		await improvedClick(this.openMenuButton);
	}

	async gotoSettings() {
		await this.clickNavigationMenu();
		await improvedClick(this.settingsAnchor);
		await pageChanged(this.page, frontendUrls.SETTINGS_PROFILE);
	}

	async gotoProfile() {
		await this.clickNavigationMenu();
		await improvedClick(this.profileAnchor);
		await pageChanged(this.page);
	}

	async gotoLogout() {
		await this.clickNavigationMenu();
		await improvedClick(this.logoutAnchor);
		await pageChanged(this.page, frontendUrls.LOGOUT);
	}

	async toggleTheme() {
		await improvedClick(this.themeToggle);
	}

	async isLoggedIn() {
		return await this.openMenuButton.isVisible();
	}

	async isLoggedOut() {
		const isLoggedIn = await this.isLoggedIn();
		return !isLoggedIn;
	}
}
