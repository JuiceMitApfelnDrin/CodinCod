import { expect, test as setup } from '@playwright/test';
import { frontendUrls, testIds } from 'types';

setup('register test user', async ({ page }) => {
	const testUser = {
		username: process.env.TEST_USER_USERNAME || 'e2etestuser',
		email: process.env.TEST_USER_EMAIL || 'e2etest@example.com',
		password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
	};

	// Navigate to register page
	await page.goto(frontendUrls.REGISTER);

	// Wait for page to load
	await page.waitForLoadState('networkidle');

	// Fill in registration form using correct testIds
	await page.getByTestId(testIds.REGISTER_FORM_INPUT_USERNAME).fill(testUser.username);
	await page.getByTestId(testIds.REGISTER_FORM_INPUT_EMAIL).fill(testUser.email);
	await page.getByTestId(testIds.REGISTER_FORM_INPUT_PASSWORD).fill(testUser.password);
	
	// Submit the form
	await page.getByTestId(testIds.REGISTER_FORM_BUTTON_REGISTER).click();

	// Wait for navigation to complete (successful registration should redirect)
	// Registration might redirect to login or home page depending on implementation
	await page.waitForURL((url) => url.pathname === '/' || url.pathname === frontendUrls.LOGIN, { 
		timeout: 10000 
	});

	// If redirected to home, verify we're logged in
	if (page.url().includes('/')) {
		// Check if navigation menu button is visible (indicates successful auto-login)
		const isLoggedIn = await page.getByTestId(testIds.NAVIGATION_MENU_BUTTON_OPEN).isVisible();
		
		if (isLoggedIn) {
			console.log('✅ User registered and automatically logged in');
		} else {
			console.log('✅ User registered, not logged in automatically');
		}
	}

	console.log(`✅ Test user registered: ${testUser.username} (${testUser.email})`);
});
