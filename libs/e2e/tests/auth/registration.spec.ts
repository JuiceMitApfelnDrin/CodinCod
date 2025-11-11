import { test, expect } from "@/fixtures/base.fixtures";
import { generateTestUsername } from "@/utils/test-helpers";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Authentication - Registration Flow Tests
 * Tests user registration with various scenarios
 * @e2e @auth
 */
test.describe("Auth - Registration", () => {
	test("should register with valid credentials @e2e @smoke", async ({
		authPage,
		page,
	}) => {
		await authPage.gotoRegister();

		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Should redirect away from register page
		await expect(page).not.toHaveURL(frontendUrls.REGISTER, { timeout: 5000 });

		// User should be authenticated - check for user menu
		// TODO: should be moved in a page object model
		const userMenuButton = page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		await expect(userMenuButton).toBeVisible({ timeout: 3000 });
	});

	test("should show validation error for duplicate username @e2e", async ({
		authPage,
		page,
	}) => {
		// Register first user
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout
		await authPage.logout();

		// Wait for logout to complete and page to be ready
		await page.waitForLoadState("networkidle");

		// Try to register with same username
		await authPage.gotoRegister();

		// Wait for register form to be visible
		await page
			.getByTestId(testIds.REGISTER_FORM_INPUT_USERNAME)
			.waitFor({ state: "visible", timeout: 10000 });

		await authPage.register(username, TEST_PASSWORD, undefined, false);

		// Should show error message about duplicate username
		const errorAlert = page.getByTestId(testIds.REGISTER_FORM_ALERT_ERROR);
		await expect(errorAlert).toBeVisible({ timeout: 5000 });
	});
	test("should toggle password visibility @e2e", async ({ authPage, page }) => {
		await authPage.gotoRegister();

		// TODO: should be moved in a page object model
		const passwordInput = page.getByTestId(
			testIds.REGISTER_FORM_INPUT_PASSWORD,
		);
		// TODO: should be moved in a page object model
		const toggleButton = page.getByTestId(
			testIds.REGISTER_FORM_BUTTON_TOGGLE_SHOW_PASSWORD,
		);

		// Initially should be password type
		await expect(passwordInput).toHaveAttribute("type", "password");

		// Click toggle to show password
		await toggleButton.click();
		await page.waitForTimeout(100);

		// Should change to text type
		await expect(passwordInput).toHaveAttribute("type", "text");

		// Click again to hide
		await toggleButton.click();
		await page.waitForTimeout(100);

		await expect(passwordInput).toHaveAttribute("type", "password");
	});

	test("should validate email format @e2e", async ({ authPage, page }) => {
		// This needs frontend investigation - Zod/Superforms validation display
		await authPage.gotoRegister();

		const username = generateTestUsername();
		const invalidEmail = "notanemail";

		// TODO: should be moved in a page object model
		await page.getByTestId(testIds.REGISTER_FORM_INPUT_USERNAME).fill(username);
		// TODO: should be moved in a page object model
		await page
			.getByTestId(testIds.REGISTER_FORM_INPUT_EMAIL)
			.fill(invalidEmail);
		// TODO: should be moved in a page object model
		await page
			.getByTestId(testIds.REGISTER_FORM_INPUT_PASSWORD)
			.fill(TEST_PASSWORD);

		// Click register button
		// TODO: should be moved in a page object model
		await page.getByTestId(testIds.REGISTER_FORM_BUTTON_REGISTER).click();

		// Should show validation error for email
		// Email validation error should appear via Zod/Superforms
		// TODO: should be moved in a page object model
		// TODO: should come from a testid constant
		await expect(
			page.locator("[data-fs-error]").filter({ hasText: /email/i }),
		).toBeVisible({ timeout: 3000 });
	});

	test("should navigate to login from register page @e2e", async ({ page }) => {
		await page.goto(frontendUrls.REGISTER);

		// Find link to login page
		// TODO: should be moved in a page object model
		// TODO: should come from a testid constant
		const loginLink = page.locator('a[href*="login"]').first();
		await loginLink.click();

		await expect(page).toHaveURL(frontendUrls.LOGIN);
	});
});
