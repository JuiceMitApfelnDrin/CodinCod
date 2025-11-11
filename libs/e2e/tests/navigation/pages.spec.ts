import { test, expect } from "@/fixtures/base.fixtures";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { generateTestUsername } from "@/utils/test-helpers";

/**
 * Page Visit Tests
 * Tests that all major pages load without errors
 * @e2e
 */
test.describe("Page Visits", () => {
	test("should load all public pages @e2e", async ({ page }) => {
		const publicPages = [
			{ url: frontendUrls.HOME, name: "Home" },
			{ url: frontendUrls.LOGIN, name: "Login" },
			{ url: frontendUrls.REGISTER, name: "Register" },
			{ url: frontendUrls.PUZZLES, name: "Puzzles" },
			{ url: frontendUrls.LEARN, name: "Learn" },
		];

		for (const { url, name } of publicPages) {
			await page.goto(url);

			// Wait for page to be loaded
			await page.waitForLoadState("domcontentloaded");

			// Check that we're on the expected page (not redirected to error page)
			expect(page.url()).toContain(url);

			// Verify page has content (not blank)
			const bodyText = await page.locator("body").textContent();
			expect(bodyText?.length).toBeGreaterThan(0);

			console.log(`${name} page loaded successfully`);
		}
	});

	test("should load authenticated pages when logged in @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Wait for redirect after registration
		await page.waitForURL((url) => !url.pathname.includes("/register"));

		const authenticatedPages = [
			{ url: frontendUrls.SETTINGS, name: "Settings" },
			{ url: frontendUrls.MULTIPLAYER, name: "Multiplayer" },
			{ url: frontendUrls.USER_PROFILE, name: "Profile" },
		];

		for (const { url, name } of authenticatedPages) {
			await page.goto(url);

			// Wait for page to be loaded
			await page.waitForLoadState("domcontentloaded");

			// Verify we're on the expected page (not redirected to login)
			expect(page.url()).toContain(url);

			// Verify page has content
			const bodyText = await page.locator("body").textContent();
			expect(bodyText?.length).toBeGreaterThan(0);

			console.log(`✓ ${name} page loaded successfully`);
		}
	});

	test("should handle puzzle detail page @e2e", async ({ page }) => {
		// First get a list of puzzles
		await page.goto(frontendUrls.PUZZLES);
		await page.waitForLoadState("domcontentloaded");

		// Try to find a puzzle link
		const puzzleLinks = page.locator('a[href*="/puzzles/"]');
		const count = await puzzleLinks.count();

		if (count > 0) {
			// Click first puzzle
			const firstPuzzle = puzzleLinks.first();
			await firstPuzzle.click();

			// Wait for puzzle page to load
			await page.waitForLoadState("domcontentloaded");

			// Verify we're on a puzzle detail page
			expect(page.url()).toMatch(/\/puzzles\/[^/]+/);

			console.log("✓ Puzzle detail page loaded successfully");
		} else {
			console.log("⚠ No puzzles found to test detail page");
			test.skip();
		}
	});

	test("should handle 404 page gracefully @e2e", async ({ page }) => {
		await page.goto("/this-page-does-not-exist-12345");
		await page.waitForLoadState("domcontentloaded");

		// Should show some kind of error message or 404 page
		const bodyText = await page.locator("body").textContent();
		expect(bodyText?.length).toBeGreaterThan(0);

		console.log("✓ 404 page handled gracefully");
	});
});
