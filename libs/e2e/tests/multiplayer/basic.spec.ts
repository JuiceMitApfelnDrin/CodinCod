import { test, expect } from "@/fixtures/base.fixtures";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { generateTestUsername } from "@/utils/test-helpers";

/**
 * Multiplayer - Basic Navigation and UI Tests
 * Tests multiplayer page access, authentication, and basic UI elements
 * @e2e @multiplayer
 */
test.describe("Multiplayer - Basic", () => {
	test.setTimeout(20_000); // WebSocket connections need extra time

	test("should load multiplayer page when authenticated @e2e @smoke", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Navigate to multiplayer
		await page.goto(frontendUrls.MULTIPLAYER);
		await page.waitForLoadState("domcontentloaded");

		// Should be on multiplayer page
		expect(page.url()).toContain(frontendUrls.MULTIPLAYER);

		// Wait for WebSocket connection (indicated by host button visibility)
		const hostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		await expect(hostButton).toBeVisible({ timeout: 15000 });
	});

	test("should display multiplayer UI elements @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Navigate to multiplayer
		await page.goto(frontendUrls.MULTIPLAYER);
		await page.waitForLoadState("domcontentloaded");

		// Check for key UI elements - wait for WebSocket connection
		const hostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		const customGameButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_CUSTOM_GAME,
		);
		const joinByCodeButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_BY_INVITE,
		);

		// Wait for host button (indicates WebSocket is connected)
		await expect(hostButton).toBeVisible({ timeout: 15000 });
		await expect(customGameButton).toBeVisible();
		await expect(joinByCodeButton).toBeVisible();
	});

	test("should redirect unauthenticated users to login @e2e", async ({
		page,
	}) => {
		// Try to access multiplayer without authentication
		await page.goto(frontendUrls.MULTIPLAYER);
		await page.waitForLoadState("domcontentloaded");

		// Should be redirected to login
		await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
	});

	test("should show current user info @e2e", async ({ authPage, page }) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Navigate to multiplayer
		await page.goto(frontendUrls.MULTIPLAYER);

		// Wait for WebSocket connection
		const hostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		await expect(hostButton).toBeVisible({ timeout: 15000 });

		// User menu should be visible (showing authenticated state)
		const userMenuButton = page.getByTestId(
			testIds.NAVIGATION_MENU_BUTTON_OPEN,
		);
		await expect(userMenuButton).toBeVisible();
	});
});
