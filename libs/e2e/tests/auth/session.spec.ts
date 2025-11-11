import { test, expect } from "@/fixtures/base.fixtures";
import { generateTestUsername } from "@/utils/test-helpers";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Authentication - Session Management Tests
 * Tests logout, session persistence, and session clearing
 * @e2e @auth
 */
test.describe("Auth - Session", () => {
	test("should logout successfully @e2e @smoke", async ({ authPage, page }) => {
		// Login first
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout
		await authPage.logout();

		// Should show login link (unauthenticated state)
		const loginLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		await expect(loginLink).toBeVisible({ timeout: 3000 });
	});

	test("should remember login state across page reloads @e2e", async ({
		authPage,
		page,
	}) => {
		// Login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Reload page
		await page.reload();

		// Should still be authenticated
		const userMenu = page.getByTestId(testIds.NAVIGATION_MENU_BUTTON_OPEN);
		await expect(userMenu).toBeVisible({ timeout: 3000 });
	});

	test("should clear authentication state after logout @e2e", async ({
		authPage,
		page,
	}) => {
		// Login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Logout
		await authPage.logout();

		// Wait for logout to complete and state to clear
		await page.waitForLoadState("networkidle");

		// Try to access protected route
		await page.goto("/puzzles/create");

		// Wait a bit for potential redirects to process
		await page.waitForLoadState("networkidle");

		// Should redirect to login
		await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
	});

	test("should handle session expiry gracefully @e2e", async ({
		authPage,
		page,
		context,
	}) => {
		// Login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Clear cookies to simulate session expiry
		await context.clearCookies();

		// Try to access protected route
		await page.goto("/puzzles/create");

		// Should redirect to login
		await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
	});

	test("should handle concurrent sessions @e2e", async ({ browser }) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();

		try {
			const { AuthPage } = await import("@/pages/auth.page");

			const auth1 = new AuthPage(page1);
			const auth2 = new AuthPage(page2);

			// Login with same user in both contexts
			await auth1.gotoRegister();
			const username = generateTestUsername();
			await auth1.register(username, TEST_PASSWORD);

			// Login in second context
			await auth2.gotoLogin();
			await auth2.login(username, TEST_PASSWORD);

			// Both should be logged in
			const menu1 = page1.getByTestId(testIds.NAVIGATION_MENU_BUTTON_OPEN);
			const menu2 = page2.getByTestId(testIds.NAVIGATION_MENU_BUTTON_OPEN);

			await expect(menu1).toBeVisible({ timeout: 3000 });
			await expect(menu2).toBeVisible({ timeout: 3000 });
		} finally {
			await context1.close();
			await context2.close();
		}
	});
});
