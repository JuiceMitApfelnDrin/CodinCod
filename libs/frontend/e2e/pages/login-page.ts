import { Locator, Page } from "@playwright/test";
import { frontendUrls } from "types";
import { testIds } from "../../src/lib/config/test-ids";
import { improvedClick } from "../helpers/improved-click";
import { pageChanged } from "../helpers/page-changed";
import { NavigationComponent } from "../helpers/components/navigation";

export class LoginPage {
	page: Page;
	navigation: NavigationComponent;

	loginH1: Locator;

	passwordInput: Locator;
	identifierInput: Locator;
	loginButton: Locator;

	constructor(page: Page) {
		this.page = page;

		this.navigation = new NavigationComponent(page);

		this.identifierInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER);
		this.passwordInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		this.loginButton = page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);
		this.loginH1 = page.getByTestId(testIds.LOGIN_PAGE_H1);
	}

	async goto() {
		await this.page.goto(frontendUrls.LOGIN);
		await pageChanged(this.page, frontendUrls.LOGIN);
	}

	async clickLogin() {
		await improvedClick(this.loginButton);
		await pageChanged(this.page, frontendUrls.ROOT);
	}

	async fillPassword(password: string) {
		await improvedClick(this.passwordInput);
		await this.passwordInput.fill(password);
	}

	async fillIdentifier(identifier: string) {
		await improvedClick(this.identifierInput);
		await this.identifierInput.fill(identifier);
	}

	private async login(username: string, password: string) {
		await this.fillIdentifier(username);
		await this.fillPassword(password);
		await this.clickLogin();
	}

	async loginWithUsernameAndPassword(username: string, password: string) {
		await this.login(username, password);
	}

	async loginWithEmailAndPassword(email: string, password: string) {
		await this.login(email, password);
	}

	async isLoginPage() {
		return await this.loginH1.isVisible();
	}
}
