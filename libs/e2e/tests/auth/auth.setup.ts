import path from "path";
import { fileURLToPath } from "url";
import { expect, test as setup } from "@playwright/test";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
	const testUser = {
		identifier:
			process.env.TEST_USER_EMAIL ||
			process.env.TEST_USER_USERNAME ||
			"e2etest@example.com",
		password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
	};

	// Navigate to login page
	await page.goto(frontendUrls.LOGIN);

	// Wait for page to load
	await page.waitForLoadState("networkidle");

	// Fill in login form using correct testIds
	await page
		.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER)
		.fill(testUser.identifier);
	await page
		.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD)
		.fill(testUser.password);

	// Submit the form
	await page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN).click();

	// Wait for navigation to complete
	await page.waitForURL("/", { timeout: 10000 });

	// Verify we're logged in by checking for the navigation menu button
	await expect(
		page.getByTestId(testIds.NAVIGATION_MENU_BUTTON_OPEN),
	).toBeVisible({ timeout: 10000 });

	// Save authentication state
	await page.context().storageState({ path: authFile });
});
