import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { testIds } from "@codincod/shared/constants/test-ids";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { TEST_PASSWORD } from "@/utils/test-constants";

/**
 * Page Object Model for authentication pages (login/register)
 */
export class AuthPage extends BasePage {
	// Locators
	readonly usernameInput: Locator;
	readonly passwordInput: Locator;
	readonly loginButton: Locator;
	readonly registerButton: Locator;
	readonly registerLink: Locator;
	readonly loginLink: Locator;

	/**
	 * Get the error message locator based on current page
	 */
	get errorMessage(): Locator {
		const url = this.page.url();
		if (url.includes("/register")) {
			return this.page.getByTestId(testIds.REGISTER_FORM_ALERT_ERROR);
		} else {
			return this.page.getByTestId(testIds.LOGIN_FORM_ALERT_ERROR);
		}
	}

	constructor(page: Page) {
		super(page);

		// Initialize locators using testIds
		this.usernameInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER);
		this.passwordInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		this.loginButton = page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);
		this.registerButton = page.getByTestId(
			testIds.REGISTER_FORM_BUTTON_REGISTER,
		);
		this.registerLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		this.loginLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
	}

	/**
	 * Navigate to login page
	 */
	async gotoLogin(): Promise<void> {
		await this.goto(frontendUrls.LOGIN);
	}

	/**
	 * Navigate to register page
	 */
	async gotoRegister(): Promise<void> {
		await this.goto(frontendUrls.REGISTER);
	}

	/**
	 * Perform login
	 * @param username - Username or email
	 * @param password - Password
	 * @param expectSuccess - Whether to wait for successful navigation (default: true)
	 */
	async login(
		username: string,
		password: string,
		expectSuccess: boolean = true,
	): Promise<void> {
		const usernameInput = this.page.getByTestId(
			testIds.LOGIN_FORM_INPUT_IDENTIFIER,
		);
		const passwordInput = this.page.getByTestId(
			testIds.LOGIN_FORM_INPUT_PASSWORD,
		);
		const loginButton = this.page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);
		const errorAlert = this.page.getByTestId(testIds.LOGIN_FORM_ALERT_ERROR);

		await this.fillInput(usernameInput, username);
		await this.fillInput(passwordInput, password);
		await this.clickElement(loginButton);

		if (expectSuccess) {
			// Wait for navigation away from login page
			await this.page.waitForURL(
				(url) => !url.pathname.includes(frontendUrls.LOGIN),
			);
		} else {
			// Wait for error message OR check if already present
			// Use a more flexible wait with OR condition
			await Promise.race([
				errorAlert.waitFor({ state: "visible", timeout: 10000 }),
				this.page.waitForLoadState("networkidle"),
			]).catch(() => {
				// If both fail, that's ok - the test will check if error is visible
			});
		}
	}

	/**
	 * Perform register
	 */
	async register(
		username: string,
		password: string = TEST_PASSWORD,
		email?: string,
		expectSuccess: boolean = true,
	): Promise<void> {
		const usernameInput = this.page.getByTestId(
			testIds.REGISTER_FORM_INPUT_USERNAME,
		);
		const emailInput = this.page.getByTestId(testIds.REGISTER_FORM_INPUT_EMAIL);
		const passwordInput = this.page.getByTestId(
			testIds.REGISTER_FORM_INPUT_PASSWORD,
		);
		const registerButton = this.page.getByTestId(
			testIds.REGISTER_FORM_BUTTON_REGISTER,
		);
		const errorAlert = this.page.getByTestId(testIds.REGISTER_FORM_ALERT_ERROR);

		// Generate email if not provided
		const userEmail = email || `${username}@test.local`;

		await this.fillInput(usernameInput, username);
		await this.fillInput(emailInput, userEmail);
		await this.fillInput(passwordInput, password);

		// Click register and wait for either navigation or error
		await this.clickElement(registerButton);

		if (expectSuccess) {
			// Wait for navigation away from register page
			await this.page.waitForURL(
				(url) => !url.pathname.includes(frontendUrls.REGISTER),
			);
		} else {
			// Wait for error message
			await errorAlert.waitFor({ state: "visible" });
		}
	}

	/**
	 * Get error message text
	 */
	async getErrorMessage(): Promise<string> {
		return await this.getText(this.errorMessage);
	}

	/**
	 * Check if logged in (by checking if we're redirected away from auth pages)
	 */
	async isLoggedIn(): Promise<boolean> {
		const url = this.getUrl();
		return (
			!url.includes(frontendUrls.LOGIN) && !url.includes(frontendUrls.REGISTER)
		);
	}

	/**
	 * Perform logout
	 */
	async logout(): Promise<void> {
		// Open user menu
		const menuButton = this.page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		await this.clickElement(menuButton);

		// Click logout link
		const logoutLink = this.page.getByTestId(
			testIds.NAVIGATION_MENU_ANCHOR_LOGOUT,
		);
		await this.clickElement(logoutLink);

		// Wait for redirect to login/home
		await this.page.waitForURL(frontendUrls.HOME);
	}
}
