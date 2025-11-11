import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	timeout: 30_000, // 30 seconds - increased from 10s for more reliability
	testDir: "./tests",

	/* Run tests in files in parallel */
	fullyParallel: true, // Enable parallel execution for faster test runs

	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,

	/* Retry on CI only */
	retries: process.env.CI ? 2 : 1,

	/* Run tests in parallel with multiple workers */
	workers: "80%", // Parallel execution - each test creates unique users

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["html"],
		["list"],
		["json", { outputFile: "test-results/results.json" }],
	],

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.BASE_URL || "http://localhost:5173",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",

		/* Screenshot on failure */
		screenshot: "only-on-failure",

		/* Video on failure */
		video: "retain-on-failure",

		/* Use test IDs */
		testIdAttribute: "data-testid",

		headless: process.env.CI ? true : false,
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// Don't use saved auth state for multiplayer tests
				// Each test creates fresh users
			},
		},
	],

	/* Run servers before starting tests */
	// Note: Servers should be started manually due to Windows environment variable issues
	// Backend: http://localhost:4002 (MIX_ENV=test)
	// Frontend: http://localhost:5173
	// Both servers must be running before executing tests
	webServer: process.env.SKIP_SERVERS
		? undefined
		: {
				command: "cd ../frontend && pnpm run dev",
				url: "http://localhost:5173",
				reuseExistingServer: true, // Servers already running
				timeout: 120 * 1000,
			},
});
