import { test, expect } from '@/fixtures/base.fixtures';
import { testIds, frontendUrls } from 'types';

/**
 * Authentication E2E tests
 * @e2e
 */
test.describe('Authentication', () => {
	test('should register a new user @e2e', async ({ authPage, page }) => {
		await authPage.gotoRegister();
		
		const username = `test_user_${Date.now()}`;
		await authPage.register(username, 'TestPassword123!');
		
		// Should redirect to puzzle page after successful registration
		await expect(page).toHaveURL(/.*puzzle/);
		
		// Verify navigation is available (user is authenticated)
		const logoutLink = page.getByTestId(testIds.NAVIGATION_MENU_ANCHOR_LOGOUT);
		await expect(logoutLink).toBeHidden(); // Hidden in collapsed menu
	});

	test('should login with existing user @e2e', async ({ authPage, page }) => {
		// First register a user
		await authPage.gotoRegister();
		const username = `test_user_${Date.now()}`;
		await authPage.register(username, 'TestPassword123!');
		
		// Logout (navigate to login)
		await authPage.gotoLogin();
		
		// Login with the same credentials
		await authPage.login(username, 'TestPassword123!');
		
		// Should be redirected to puzzle page
		await expect(page).toHaveURL(/.*puzzle/);
	});

	test('should show error for invalid credentials @e2e', async ({ authPage }) => {
		await authPage.gotoLogin();
		
		await authPage.login('nonexistent_user', 'wrongpassword');
		
		// Should show error message
		await expect(authPage.errorMessage).toBeVisible({ timeout: 5000 });
	});

	test('should show error for duplicate username @e2e', async ({ authPage, page }) => {
		// Register first user
		await authPage.gotoRegister();
		const username = `test_user_${Date.now()}`;
		await authPage.register(username, 'TestPassword123!');
		
		// Logout
		await page.goto(frontendUrls.LOGOUT);
		await page.waitForTimeout(500);
		
		// Try to register with same username
		await authPage.gotoRegister();
		await authPage.register(username, 'TestPassword123!');
		
		// Should show error
		await expect(authPage.errorMessage).toBeVisible({ timeout: 5000 });
	});
	
	test('should navigate using test IDs @e2e', async ({ page }) => {
		await page.goto(frontendUrls.ROOT);
		
		// Click login link using test ID
		const loginLink = page.getByTestId(testIds.NAVIGATION_ANCHOR_LOGIN);
		await expect(loginLink).toBeVisible();
		await loginLink.click();
		
		// Should navigate to login page
		await expect(page).toHaveURL(frontendUrls.LOGIN);
	});
});
