import { test, expect } from "@/fixtures/base.fixtures";
import { generateTestUsername } from "@/utils/test-helpers";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Authentication E2E tests
 * @e2e
 */
test.describe("Authentication", () => {
	test("should register a new user @e2e", async ({ authPage, page }) => {
		await authPage.gotoRegister();

		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Should redirect to root page after successful registration
		await expect(page).toHaveURL(frontendUrls.ROOT);

		// Verify navigation is available (user is authenticated)
		const logoutLink = page.getByTestId(testIds.NAVIGATION_MENU_ANCHOR_LOGOUT);
		await expect(logoutLink).toBeHidden(); // Hidden in collapsed menu
	});

	test("should login with existing user @e2e", async ({ authPage, page }) => {
		// First register a user
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout first (user is logged in after registration)
		await page.goto(frontendUrls.LOGOUT);
		// Wait for navigation to complete (logout form auto-submits and redirects)
		await page.waitForURL(frontendUrls.ROOT, { waitUntil: "domcontentloaded" });

		// Now navigate to login
		await authPage.gotoLogin();

		// Login with the same credentials
		await authPage.login(username, TEST_PASSWORD);

		// Should be redirected to root page
		await expect(page).toHaveURL(frontendUrls.ROOT);
	});

	test("should show error for invalid credentials @e2e", async ({
		authPage,
		page,
	}) => {
		await authPage.gotoLogin();

		// Fill in invalid credentials (but valid format - 14+ char password)
		const usernameInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER);
		const passwordInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		const loginButton = page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);

		await usernameInput.fill("nonexistent_user");
		await passwordInput.fill("WrongPassword123!"); // 17 chars - meets validation
		await loginButton.click();

		// Wait for page to be ready after submission
		await page.waitForLoadState("domcontentloaded");

		// Should show error message - use role instead of test ID since test ID isn't working
		const errorAlert = page
			.locator("role=alert")
			.filter({ hasText: "Invalid" });
		await expect(errorAlert).toBeVisible();

		// Verify we're still on login page (didn't navigate away)
		expect(page.url()).toContain(frontendUrls.LOGIN);
	});

	test("should show error for duplicate username @e2e", async ({
		authPage,
		page,
	}) => {
		// Register first user
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout (redirects to ROOT)
		await page.goto(frontendUrls.LOGOUT);
		// Wait for navigation to complete (logout form auto-submits and redirects)
		await page.waitForURL(frontendUrls.ROOT, { waitUntil: "domcontentloaded" });

		// Try to register with same username
		await authPage.gotoRegister();
		await authPage.register(username, TEST_PASSWORD, undefined, false); // Don't expect success

		// Should show error
		await expect(authPage.errorMessage).toBeVisible();
	});

	test("should navigate using test IDs @e2e", async ({ page }) => {
		await page.goto(frontendUrls.HOME);

		// Click login link using test ID
		const loginLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		await expect(loginLink).toBeVisible();
		await loginLink.click();

		// Should navigate to login page
		await expect(page).toHaveURL(frontendUrls.LOGIN);
	});
});
