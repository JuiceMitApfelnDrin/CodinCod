import { test, expect } from "@/fixtures/base.fixtures";
import { generateTestUsername } from "@/utils/test-helpers";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Authentication - Login Flow Tests
 * Tests user login with various scenarios
 * @e2e @auth
 */
test.describe("Auth - Login", () => {
	test("should login with valid credentials @e2e @smoke", async ({
		authPage,
		page,
	}) => {
		// Create a user first
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout
		await authPage.logout();
		await page.waitForLoadState("networkidle");

		// Login
		await authPage.gotoLogin();
		await page
			.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER)
			.waitFor({ state: "visible", timeout: 10000 });

		await authPage.login(username, TEST_PASSWORD);

		// Should be logged in - check for user menu
		const userMenuButton = page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		await expect(userMenuButton).toBeVisible({ timeout: 3000 });
	});

	test("should reject login with incorrect password @e2e", async ({
		authPage,
		page,
	}) => {
		// Create a user first
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout
		await authPage.logout();
		await page.waitForLoadState("networkidle");

		// Try to login with wrong password
		await authPage.gotoLogin();
		await page
			.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER)
			.waitFor({ state: "visible", timeout: 10000 });

		await authPage.login(username, "WrongPassword123!", false);

		// Should show error message
		const errorAlert = page.getByTestId(testIds.LOGIN_FORM_ALERT_ERROR);
		await expect(errorAlert).toBeVisible({ timeout: 5000 });

		// Should still be on login page
		await expect(page).toHaveURL(frontendUrls.LOGIN);
	});

	test("should reject login with non-existent user @e2e", async ({
		authPage,
		page,
	}) => {
		await authPage.gotoLogin();
		await authPage.login(
			"nonexistent_user_" + Date.now(),
			TEST_PASSWORD,
			false,
		);

		// Should show error message
		const errorAlert = page.getByTestId(testIds.LOGIN_FORM_ALERT_ERROR);
		await expect(errorAlert).toBeVisible({ timeout: 5000 });
	});

	test("should allow login with email instead of username @e2e", async ({
		authPage,
		page,
	}) => {
		// Create user with email
		await authPage.gotoRegister();
		const username = generateTestUsername();
		const email = `${username}@test.com`;

		await page.getByTestId(testIds.REGISTER_FORM_INPUT_USERNAME).fill(username);
		await page.getByTestId(testIds.REGISTER_FORM_INPUT_EMAIL).fill(email);
		await page
			.getByTestId(testIds.REGISTER_FORM_INPUT_PASSWORD)
			.fill(TEST_PASSWORD);
		await page.getByTestId(testIds.REGISTER_FORM_BUTTON_REGISTER).click();

		// Wait for successful registration
		await expect(page).not.toHaveURL(frontendUrls.REGISTER, { timeout: 5000 });

		// Logout
		await authPage.logout();
		await page.waitForLoadState("networkidle");

		// Login with email
		await authPage.gotoLogin();
		await page
			.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER)
			.waitFor({ state: "visible", timeout: 10000 });

		await authPage.login(email, TEST_PASSWORD);

		// Should be logged in
		const userMenuButton = page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		await expect(userMenuButton).toBeVisible({ timeout: 3000 });
	});

	test("should toggle password visibility @e2e", async ({ authPage, page }) => {
		await authPage.gotoLogin();

		const passwordInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		const toggleButton = page.getByTestId(
			testIds.LOGIN_FORM_BUTTON_TOGGLE_SHOW_PASSWORD,
		);

		// Initially should be password type
		await expect(passwordInput).toHaveAttribute("type", "password");

		// Click toggle
		await toggleButton.click();
		await page.waitForTimeout(100); // Small delay for state update

		// Should change to text type
		await expect(passwordInput).toHaveAttribute("type", "text");
	});

	test("should navigate to register from login page @e2e", async ({ page }) => {
		await page.goto(frontendUrls.LOGIN);

		// Find link to register page
		const registerLink = page.locator('a[href*="register"]').first();
		await registerLink.click();

		await expect(page).toHaveURL(frontendUrls.REGISTER);
	});
});
