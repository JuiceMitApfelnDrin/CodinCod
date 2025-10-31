import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { frontendUrls, testIds } from 'types';

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
	readonly errorMessage: Locator;

	constructor(page: Page) {
		super(page);
		
		// Initialize locators using testIds
		this.usernameInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER);
		this.passwordInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		this.loginButton = page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);
		this.registerButton = page.getByTestId(testIds.REGISTER_FORM_BUTTON_REGISTER);
		this.registerLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		this.loginLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		this.errorMessage = page.locator('[role="alert"], .error-message, .text-destructive').first();
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
	 */
	async login(username: string, password: string): Promise<void> {
		const usernameInput = this.page.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER);
		const passwordInput = this.page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		const loginButton = this.page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);
		
		await this.fillInput(usernameInput, username);
		await this.fillInput(passwordInput, password);
		await this.clickElement(loginButton);
		
		// Wait for navigation
		await this.page.waitForURL('**/puzzle', { timeout: 10000 });
	}

	/**
	 * Perform registration
	 */
	async register(username: string, password: string): Promise<void> {
		const usernameInput = this.page.getByTestId(testIds.REGISTER_FORM_INPUT_USERNAME);
		const passwordInput = this.page.getByTestId(testIds.REGISTER_FORM_INPUT_PASSWORD);
		const registerButton = this.page.getByTestId(testIds.REGISTER_FORM_BUTTON_REGISTER);
		
		await this.fillInput(usernameInput, username);
		await this.fillInput(passwordInput, password);
		await this.clickElement(registerButton);
		
		// Wait for navigation or error
		await Promise.race([
			this.page.waitForURL('**/puzzle', { timeout: 10000 }),
			this.errorMessage.waitFor({ state: 'visible', timeout: 10000 })
		]);
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
		return !url.includes(frontendUrls.LOGIN) && !url.includes(frontendUrls.REGISTER);
	}
}
