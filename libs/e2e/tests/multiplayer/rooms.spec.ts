import { test, expect } from "@/fixtures/base.fixtures";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { generateTestUsername } from "@/utils/test-helpers";

/**
 * Multiplayer - Room Creation Tests
 * Tests creating and managing multiplayer game rooms
 * @e2e @multiplayer
 */
test.describe("Multiplayer - Rooms", () => {
	test.setTimeout(25_000); // Room creation with WebSocket needs extra time

	test("should create a new room as host @e2e @smoke", async ({
		authPage,
		page,
	}) => {
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

		// Click host room button
		await hostButton.click();

		// Should navigate to a room (URL contains /multiplayer/)
		await expect(page).toHaveURL(/\/multiplayer\/[^/]+/, { timeout: 10000 });

		// Should show room UI elements
		// Host should see start button or leave button
		const startButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM,
		);
		const leaveButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM,
		);

		// Either start or leave button should be visible (room UI loaded)
		const isHostUIVisible =
			(await startButton.isVisible().catch(() => false)) ||
			(await leaveButton.isVisible().catch(() => false));

		expect(isHostUIVisible).toBe(true);
	});

	test("should display room code for inviting players @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Navigate to multiplayer
		await page.goto(frontendUrls.MULTIPLAYER);

		// Wait for WebSocket and click host
		const hostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		await expect(hostButton).toBeVisible({ timeout: 15000 });
		await hostButton.click();

		// Wait for room page
		await expect(page).toHaveURL(/\/multiplayer\/[^/]+/, { timeout: 10000 });

		// Room code should be displayed for sharing
		// Look for invite code or copy invite button
		const inviteCodeInput = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_INPUT_INVITE_CODE,
		);
		const copyInviteButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_COPY_INVITE,
		);

		// Either invite code input or copy button should be visible
		const hasInviteUI =
			(await inviteCodeInput.isVisible().catch(() => false)) ||
			(await copyInviteButton.isVisible().catch(() => false));

		expect(hasInviteUI).toBe(true);
	});

	test("should show host controls to owner @e2e", async ({
		authPage,
		page,
	}) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Navigate to multiplayer and create room
		await page.goto(frontendUrls.MULTIPLAYER);

		const hostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		await expect(hostButton).toBeVisible({ timeout: 15000 });
		await hostButton.click();

		// Wait for room
		await expect(page).toHaveURL(/\/multiplayer\/[^/]+/, { timeout: 10000 });

		// Host should see start room button (even if disabled)
		const startButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM,
		);

		// Button should exist (may be disabled if not enough players)
		await expect(startButton).toBeAttached({ timeout: 5000 });
	});

	test("should allow host to leave room @e2e", async ({ authPage, page }) => {
		// Register and login
		await authPage.gotoRegister();
		const username = generateTestUsername();
		await authPage.register(username, TEST_PASSWORD);

		// Navigate to multiplayer and create room
		await page.goto(frontendUrls.MULTIPLAYER);

		const hostButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM,
		);
		await expect(hostButton).toBeVisible({ timeout: 15000 });
		await hostButton.click();

		// Wait for room
		await expect(page).toHaveURL(/\/multiplayer\/[^/]+/, { timeout: 10000 });

		// Find and click leave button
		const leaveButton = page.getByTestId(
			testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM,
		);
		await expect(leaveButton).toBeVisible({ timeout: 5000 });
		await leaveButton.click();

		// Should navigate back to multiplayer lobby
		await expect(page).toHaveURL(frontendUrls.MULTIPLAYER, { timeout: 5000 });
	});
});
