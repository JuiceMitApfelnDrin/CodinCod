import type { Page, Locator } from "@playwright/test";
import { EnhancedBasePage } from "./enhanced-base.page.js";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Enhanced Authentication page object
 */
export class EnhancedAuthPage extends EnhancedBasePage {
	// Login form locators
	readonly loginIdentifierInput: Locator;
	readonly loginPasswordInput: Locator;
	readonly loginButton: Locator;

	// Register form locators
	readonly registerUsernameInput: Locator;
	readonly registerEmailInput: Locator;
	readonly registerPasswordInput: Locator;
	readonly registerButton: Locator;

	constructor(page: Page) {
		super(page);

		// Login form
		this.loginIdentifierInput = page.getByTestId(
			testIds.LOGIN_FORM_INPUT_IDENTIFIER,
		);
		this.loginPasswordInput = page.getByTestId(
			testIds.LOGIN_FORM_INPUT_PASSWORD,
		);
		this.loginButton = page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);

		// Register form
		this.registerUsernameInput = page.getByTestId(
			testIds.REGISTER_FORM_INPUT_USERNAME,
		);
		this.registerEmailInput = page.getByTestId(
			testIds.REGISTER_FORM_INPUT_EMAIL,
		);
		this.registerPasswordInput = page.getByTestId(
			testIds.REGISTER_FORM_INPUT_PASSWORD,
		);
		this.registerButton = page.getByTestId(
			testIds.REGISTER_FORM_BUTTON_REGISTER,
		);
	}

	/**
	 * Navigate to login page
	 */
	async gotoLogin(): Promise<void> {
		await this.goto("/login");
		await this.waitForElement(this.loginButton);
	}

	/**
	 * Navigate to register page
	 */
	async gotoRegister(): Promise<void> {
		await this.goto("/register");
		await this.waitForElement(this.registerButton);
	}

	/**
	 * Login with credentials
	 */
	async login(identifier: string, password: string): Promise<void> {
		await this.fill(this.loginIdentifierInput, identifier);
		await this.fill(this.loginPasswordInput, password);
		await this.click(this.loginButton, true);

		// Wait for redirect after successful login
		await this.page.waitForURL(/^(?!.*\/login)/, { timeout: 10000 });
		await this.page
			.waitForLoadState("networkidle", { timeout: 5000 })
			.catch(() => {});
	}

	/**
	 * Register new user
	 * If registration fails (e.g., user already exists), tries to login instead
	 */
	async register(
		username: string,
		password: string,
		email?: string,
	): Promise<void> {
		await this.fill(this.registerUsernameInput, username);

		if (email) {
			await this.fill(this.registerEmailInput, email);
		} else {
			// Generate email from username if not provided
			await this.fill(this.registerEmailInput, `${username}@test.local`);
		}

		await this.fill(this.registerPasswordInput, password);

		// Wait for API response
		const responsePromise = this.page.waitForResponse(
			(response) =>
				response.url().includes("/api/") &&
				response.request().method() === "POST",
		);

		await this.click(this.registerButton, true);
		const response = await responsePromise;

		// Check if we're still on register page (registration failed)
		const currentUrl = this.page.url();
		if (currentUrl.includes("/register")) {
			console.log(
				`Registration failed for ${username}, likely already exists. Trying login...`,
			);
			// Navigate to login and try logging in instead
			await this.gotoLogin();
			await this.login(username, password);
		} else {
			// Registration succeeded, wait for redirect to complete
			await this.page.waitForLoadState("domcontentloaded");
		}
	}

	/**
	 * Logout (navigate to logout endpoint)
	 */
	async logout(): Promise<void> {
		// Open navigation menu
		const menuButton = this.page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		if (await this.isVisible(menuButton)) {
			await this.click(menuButton);
			// Wait for menu to be visible
			const logoutLink = this.page.getByTestId(
				testIds.NAVIGATION_MENU_ANCHOR_LOGOUT,
			);
			await logoutLink.waitFor({ state: "visible" });
		}

		// Click logout
		const logoutLink = this.page.getByTestId(
			testIds.NAVIGATION_MENU_ANCHOR_LOGOUT,
		);
		await this.click(logoutLink, true);

		// Wait for redirect to login or home
		await this.page.waitForURL(/\/(login|)$/);
	}

	/**
	 * Check if user is logged in
	 */
	async isLoggedIn(): Promise<boolean> {
		const menuButton = this.page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		return await this.isVisible(menuButton);
	}
}
