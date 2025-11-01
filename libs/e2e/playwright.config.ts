import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	timeout: 120_000,
	testDir: './tests',
	
	/* Run tests in files in parallel */
	fullyParallel: false, // Multiplayer tests need coordination
	
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['html'],
		['list'],
		['json', { outputFile: 'test-results/results.json' }]
	],
	
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.BASE_URL || 'http://localhost:5173',
		
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		
		/* Screenshot on failure */
		screenshot: 'only-on-failure',
		
		/* Video on failure */
		video: 'retain-on-failure',

		/* Use test IDs */
		testIdAttribute: 'data-testid',
		
		headless: process.env.CI ? true : false,
	},

	/* Configure projects for major browsers */
	projects: [
		// Setup project to authenticate
		{ name: 'setup', testMatch: /.*\.setup\.ts/, teardown: 'teardown' },
		
		// Main test project with authentication
		{
			name: 'chromium',
			use: { 
				...devices['Desktop Chrome'],
				storageState: 'playwright/.auth/user.json'
			},
			dependencies: ['setup']
		},
		
		// Teardown project
		{ name: 'teardown', testMatch: /global\.teardown\.ts/ }
	],

	/* Run your local dev server before starting the tests */
	webServer: process.env.SKIP_WEB_SERVER ? undefined : {
		command: 'cd ../frontend && pnpm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
