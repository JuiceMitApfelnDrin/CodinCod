import { test, expect } from "@/fixtures/base.fixtures";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { generateTestUsername } from "@/utils/test-helpers";

/**
 * Authentication & Authorization Tests
 * Tests route protection and authentication state management
 * @e2e
 */
test.describe("Authentication & Authorization", () => {
	test("should redirect unauthenticated users from protected pages @e2e", async ({
		page,
	}) => {
		const protectedPages = [
			frontendUrls.SETTINGS,
			frontendUrls.MULTIPLAYER,
			frontendUrls.PUZZLE_CREATE,
		];

		for (const url of protectedPages) {
			await page.goto(url);

			await page.waitForLoadState("domcontentloaded");

			// Should be redirected to login page or root
			const currentUrl = page.url();
			const isRedirected =
				currentUrl.includes(frontendUrls.LOGIN) ||
				currentUrl === new URL(frontendUrls.ROOT, page.url()).href;

			expect(isRedirected).toBe(true);
			console.log(`✓ ${url} properly redirected unauthenticated user`);
		}
	});

	test("should allow authenticated users to access protected pages @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Wait for successful registration
		await page.waitForURL((url) => !url.pathname.includes("/register"));

		const protectedPages = [
			{ url: frontendUrls.SETTINGS, name: "Settings" },
			{ url: frontendUrls.MULTIPLAYER, name: "Multiplayer" },
		];

		for (const { url, name } of protectedPages) {
			await page.goto(url);
			await page.waitForLoadState("domcontentloaded");

			// Should stay on the protected page (not redirected)
			expect(page.url()).toContain(url);
			console.log(`✓ ${name} accessible to authenticated user`);
		}
	});

	test("should prevent authenticated users from accessing auth-only pages @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Wait for successful registration
		await page.waitForURL((url) => !url.pathname.includes("/register"));

		const authOnlyPages = [
			{ url: frontendUrls.LOGIN, name: "Login" },
			{ url: frontendUrls.REGISTER, name: "Register" },
		];

		for (const { url, name } of authOnlyPages) {
			await page.goto(url);
			await page.waitForLoadState("domcontentloaded");

			// Should be redirected away from auth pages when already logged in
			const currentUrl = page.url();
			const isRedirected = !currentUrl.includes(url);

			expect(isRedirected).toBe(true);
			console.log(`✓ ${name} redirected authenticated user`);
		}
	});

	test("should maintain authentication across page navigation @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Wait for successful registration
		await page.waitForURL((url) => !url.pathname.includes("/register"));

		// Navigate to multiple pages
		await page.goto(frontendUrls.PUZZLES);
		await page.waitForLoadState("domcontentloaded");

		await page.goto(frontendUrls.MULTIPLAYER);
		await page.waitForLoadState("domcontentloaded");

		// Should still be on multiplayer (not redirected to login)
		expect(page.url()).toContain(frontendUrls.MULTIPLAYER);

		await page.goto(frontendUrls.SETTINGS);
		await page.waitForLoadState("domcontentloaded");

		// Should still be authenticated
		expect(page.url()).toContain(frontendUrls.SETTINGS);

		console.log("✓ Authentication persisted across navigation");
	});

	test("should clear authentication after logout @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Wait for successful registration
		await page.waitForURL((url) => !url.pathname.includes("/register"));

		// Logout using the page object
		await authPage.logout();

		// Wait for logout to complete
		await page.waitForLoadState("domcontentloaded");

		// Try to access protected page
		await page.goto(frontendUrls.SETTINGS);
		await page.waitForLoadState("domcontentloaded");

		// Should be redirected away from protected page
		const currentUrl = page.url();
		const isRedirected =
			currentUrl.includes(frontendUrls.LOGIN) ||
			currentUrl === new URL(frontendUrls.ROOT, page.url()).href ||
			!currentUrl.includes(frontendUrls.SETTINGS);

		expect(isRedirected).toBe(true);
		console.log("✓ Authentication cleared after logout");
	});

	test("should not expose auth tokens in URLs @e2e", async ({
		authPage,
		page,
	}) => {
		// Register
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Wait for successful registration
		await page.waitForURL((url) => !url.pathname.includes("/register"));

		// Check that no sensitive tokens are in URL
		const currentUrl = page.url();

		// Check for common token parameter patterns
		const hasSensitiveParams =
			/[?&](token|auth|jwt|bearer|session|access_token|refresh_token)=/i.test(
				currentUrl,
			);

		expect(hasSensitiveParams).toBe(false);
		console.log("✓ No auth tokens in URL parameters");

		// Navigate to protected page
		await page.goto(frontendUrls.MULTIPLAYER);
		await page.waitForLoadState("domcontentloaded");

		const multiplayerUrl = page.url();
		const hasTokensInProtected =
			/[?&](token|auth|jwt|bearer|session|access_token|refresh_token)=/i.test(
				multiplayerUrl,
			);

		expect(hasTokensInProtected).toBe(false);
		console.log("✓ No auth tokens in protected page URLs");
	});
});
