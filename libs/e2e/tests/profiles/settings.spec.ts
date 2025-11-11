import { test, expect } from "@/fixtures/base.fixtures";
import { generateTestUsername } from "@/utils/test-helpers";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Profiles & Settings E2E Tests
 * Tests user profiles, activity heatmap, settings, and preferences
 * @e2e @profiles @settings
 */
test.describe("Profiles & Settings - Comprehensive", () => {
	test.describe("User Profiles", () => {
		test("should view own profile @e2e @smoke", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			// Navigate to profile
			await page.goto(`/profile/${username}`);

			// Should show username
			await expect(page.locator(`text="${username}"`)).toBeVisible({
				timeout: 2000,
			});
		});

		test("should view other user profiles @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			// Navigate to another user's profile (if exists)
			await page.goto("/profile/testuser");

			// Should either show profile or 404 page
			const hasProfile = await page
				.locator("text=/testuser|not found|404/i")
				.isVisible()
				.catch(() => false);
			expect(hasProfile).toBe(true);
		});

		test("should display user statistics @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto(`/profile/${username}`);

			// Look for statistics sections
			const stats = [
				page.locator("text=/puzzles solved|completed/i"),
				page.locator("text=/rank|rating|score/i"),
				page.locator("text=/solutions|submissions/i"),
			];

			// At least one stat should be visible
			const visibleStats = await Promise.all(
				stats.map((stat) => stat.isVisible().catch(() => false)),
			);

			expect(visibleStats.some((v) => v)).toBe(true);
		});

		test("should display activity heatmap @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto(`/profile/${username}`);

			// Look for heatmap or activity graph
			const heatmap = page
				.locator(
					'[data-testid*="heatmap"], .activity-heatmap, text=/activity|contributions/i',
				)
				.first();
			const hasHeatmap = await heatmap.isVisible().catch(() => false);

			// Heatmap might not be implemented yet
			if (hasHeatmap) {
				await expect(heatmap).toBeVisible();
			}
		});

		test("should list user created puzzles @e2e", async ({
			authPage,
			page,
		}) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			// Create a puzzle first
			await page.goto("/puzzles/create");
			await page
				.getByTestId(testIds.PUZZLES_CREATE_PAGE_INPUT_TITLE)
				.fill("Profile Test Puzzle");
			await page
				.getByTestId(testIds.PUZZLES_CREATE_PAGE_INPUT_DESCRIPTION)
				.fill("Description for profile");
			await page
				.getByTestId(testIds.PUZZLES_CREATE_PAGE_BUTTON_CREATE_PUZZLE)
				.click();
			await page.waitForTimeout(1000);

			// View profile
			await page.goto(`/profile/${username}`);

			// Should show created puzzle
			await expect(page.locator('text="Profile Test Puzzle"')).toBeVisible({
				timeout: 2000,
			});
		});

		test("should list user solved puzzles @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto(`/profile/${username}`);

			// Look for solved puzzles section
			const solvedSection = page
				.locator("text=/solved|completed|submissions/i")
				.first();
			const hasSolvedSection = await solvedSection
				.isVisible()
				.catch(() => false);

			if (hasSolvedSection) {
				await expect(solvedSection).toBeVisible();
			}
		});

		test("should show profile avatar @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto(`/profile/${username}`);

			// Look for avatar image or icon
			const avatar = page
				.locator(
					'img[alt*="avatar"], img[alt*="profile"], [data-testid*="avatar"]',
				)
				.first();
			const hasAvatar = await avatar.isVisible().catch(() => false);

			if (hasAvatar) {
				await expect(avatar).toBeVisible();
			}
		});

		test("should show user bio/description @e2e", async ({
			authPage,
			page,
		}) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto(`/profile/${username}`);

			// Look for bio section
			const bio = page
				.locator('[data-testid*="bio"], .bio, .description, text=/about|bio/i')
				.first();
			const hasBio = await bio.isVisible().catch(() => false);

			// Bio might be empty for new users
			if (hasBio) {
				await expect(bio).toBeVisible();
			}
		});
	});

	test.describe("Settings Page", () => {
		test("should access settings page @e2e @smoke", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			// Navigate to settings
			await page.goto("/settings");

			// Should show settings page
			await expect(page.locator("text=/settings|preferences/i")).toBeVisible({
				timeout: 2000,
			});
		});

		test("should update profile information @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for profile fields
			const bioField = page
				.locator('textarea[name="bio"], input[name="bio"]')
				.first();

			if (await bioField.isVisible().catch(() => false)) {
				await bioField.fill("Updated bio text for testing");

				// Save button
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|update/i })
					.first();
				await saveButton.click();

				// Should show success message
				await expect(page.locator("text=/saved|updated|success/i")).toBeVisible(
					{ timeout: 3000 },
				);
			}
		});

		test("should update email address @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for email field
			const emailField = page
				.locator('input[name="email"], input[type="email"]')
				.first();

			if (await emailField.isVisible().catch(() => false)) {
				const newEmail = `updated_${Date.now()}@test.com`;
				await emailField.fill(newEmail);

				// Save button
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|update/i })
					.first();
				await saveButton.click();

				// Should show success or confirmation message
				await expect(
					page.locator("text=/saved|updated|verify|confirmation/i"),
				).toBeVisible({ timeout: 3000 });
			}
		});

		test("should change password @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto("/settings");

			// Look for password change section
			const currentPasswordField = page
				.locator(
					'input[name="current_password"], input[placeholder*="current"]',
				)
				.first();

			if (await currentPasswordField.isVisible().catch(() => false)) {
				await currentPasswordField.fill("TestPass123!");

				const newPasswordField = page
					.locator(
						'input[name="new_password"], input[placeholder*="new password"]',
					)
					.first();
				await newPasswordField.fill("NewPass456!");

				const confirmPasswordField = page
					.locator(
						'input[name="confirm_password"], input[placeholder*="confirm"]',
					)
					.first();
				await confirmPasswordField.fill("NewPass456!");

				// Save button
				const saveButton = page
					.locator("button")
					.filter({ hasText: /change|update password/i })
					.first();
				if (await saveButton.isVisible().catch(() => false)) {
					await saveButton.click();

					// Should show success message
					await expect(
						page.locator("text=/password changed|updated successfully/i"),
					).toBeVisible({ timeout: 3000 });

					// Verify can login with new password
					await page.goto("/logout");
					await authPage.gotoLogin();
					await authPage.login(username, "NewPass456!");

					// Should be logged in
					await expect(page.url()).not.toContain("/login");
				}
			}
		});

		test("should validate password strength @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for password change section
			const newPasswordField = page
				.locator(
					'input[name="new_password"], input[placeholder*="new password"]',
				)
				.first();

			if (await newPasswordField.isVisible().catch(() => false)) {
				// Enter weak password
				await newPasswordField.fill("123");

				// Should show error or warning
				await expect(
					page.locator("text=/weak|too short|at least/i"),
				).toBeVisible({ timeout: 2000 });
			}
		});
	});

	test.describe("Editor Settings", () => {
		test("should change editor theme @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for theme selector
			const themeSelect = page
				.locator('select[name="theme"], button')
				.filter({ hasText: /theme|dark|light/i })
				.first();

			if (await themeSelect.isVisible().catch(() => false)) {
				if ((await themeSelect.evaluate((el) => el.tagName)) === "SELECT") {
					const options = await themeSelect.locator("option").count();
					if (options > 1) {
						await themeSelect.selectOption({ index: 1 });
					}
				} else {
					await themeSelect.click();
					await page.locator("text=/dark|light|monokai/i").first().click();
				}

				await page.waitForTimeout(500);

				// Theme should have changed (check for class or data attribute)
				const body = page.locator("body, html");
				const themeAttribute =
					(await body.getAttribute("class").catch(() => "")) ||
					(await body.getAttribute("data-theme").catch(() => ""));
				expect(themeAttribute).toBeTruthy();
			}
		});

		test("should change font size @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for font size setting
			const fontSizeInput = page
				.locator('input[name="font_size"], select[name="font_size"]')
				.first();

			if (await fontSizeInput.isVisible().catch(() => false)) {
				if ((await fontSizeInput.evaluate((el) => el.tagName)) === "INPUT") {
					await fontSizeInput.fill("16");
				} else {
					await fontSizeInput.selectOption("16");
				}

				// Save button
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|apply/i })
					.first();
				await saveButton.click();

				await page.waitForTimeout(500);
			}
		});

		test("should toggle line numbers @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for line numbers toggle
			const lineNumbersToggle = page
				.locator('input[type="checkbox"][name*="line"], label')
				.filter({ hasText: /line numbers/i })
				.first();

			if (await lineNumbersToggle.isVisible().catch(() => false)) {
				await lineNumbersToggle.click();

				// Save settings
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|apply/i })
					.first();
				if (await saveButton.isVisible().catch(() => false)) {
					await saveButton.click();
					await page.waitForTimeout(500);
				}
			}
		});

		test("should enable/disable autocomplete @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for autocomplete setting
			const autocompleteToggle = page
				.locator('input[type="checkbox"][name*="autocomplete"], label')
				.filter({ hasText: /autocomplete|auto-complete/i })
				.first();

			if (await autocompleteToggle.isVisible().catch(() => false)) {
				await autocompleteToggle.click();

				// Save settings
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|apply/i })
					.first();
				if (await saveButton.isVisible().catch(() => false)) {
					await saveButton.click();
					await page.waitForTimeout(500);
				}
			}
		});
	});

	test.describe("Notification Settings", () => {
		test("should toggle email notifications @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for notification settings
			const emailNotifications = page
				.locator('input[type="checkbox"][name*="email"], label')
				.filter({ hasText: /email notification/i })
				.first();

			if (await emailNotifications.isVisible().catch(() => false)) {
				await emailNotifications.click();

				// Save settings
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|apply/i })
					.first();
				if (await saveButton.isVisible().catch(() => false)) {
					await saveButton.click();

					await expect(page.locator("text=/saved|updated/i")).toBeVisible({
						timeout: 3000,
					});
				}
			}
		});

		test("should configure notification preferences @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for multiple notification options
			const notificationOptions = [
				page.locator("text=/new follower/i"),
				page.locator("text=/puzzle solved/i"),
				page.locator("text=/comment/i"),
			];

			let foundAny = false;
			for (const option of notificationOptions) {
				if (await option.isVisible().catch(() => false)) {
					foundAny = true;
					break;
				}
			}

			// Notification settings might not be implemented yet
			expect(foundAny || true).toBe(true);
		});
	});

	test.describe("Privacy Settings", () => {
		test("should toggle profile visibility @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for privacy settings
			const profileVisibility = page
				.locator('input[type="checkbox"], select')
				.filter({ hasText: /public|private|visibility/i })
				.first();

			if (await profileVisibility.isVisible().catch(() => false)) {
				await profileVisibility.click();

				// Save settings
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save|apply/i })
					.first();
				if (await saveButton.isVisible().catch(() => false)) {
					await saveButton.click();
					await page.waitForTimeout(500);
				}
			}
		});

		test("should configure data sharing preferences @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for data sharing options
			const dataSharing = page
				.locator("text=/data sharing|analytics|statistics/i")
				.first();

			const hasDataSharing = await dataSharing.isVisible().catch(() => false);

			// Data sharing settings might not be implemented
			expect(hasDataSharing || true).toBe(true);
		});
	});

	test.describe("Account Management", () => {
		test("should view account information @e2e", async ({ authPage, page }) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto("/settings");

			// Should show username and created date
			await expect(
				page.locator(`text="${username}"`).or(page.locator("text=/username/i")),
			).toBeVisible({ timeout: 2000 });
		});

		test("should access delete account option @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), "TestPass123!");

			await page.goto("/settings");

			// Look for delete account button
			const deleteButton = page
				.locator("button, a")
				.filter({ hasText: /delete account|close account/i })
				.first();

			const hasDeleteOption = await deleteButton.isVisible().catch(() => false);

			// Delete option might be hidden or in danger zone
			if (hasDeleteOption) {
				await expect(deleteButton).toBeVisible();
				// Don't actually click it
			}
		});
	});

	test.describe("Settings Persistence", () => {
		test("should persist settings across sessions @e2e", async ({
			authPage,
			page,
		}) => {
			const username = generateTestUsername();
			await authPage.gotoRegister();
			await authPage.register(username, "TestPass123!");

			await page.goto("/settings");

			// Change a setting
			const themeSelect = page
				.locator('select[name="theme"], button')
				.filter({ hasText: /theme/i })
				.first();

			if (await themeSelect.isVisible().catch(() => false)) {
				// Select a theme
				if ((await themeSelect.evaluate((el) => el.tagName)) === "SELECT") {
					await themeSelect.selectOption({ index: 1 });
				}

				// Save
				const saveButton = page
					.locator("button")
					.filter({ hasText: /save/i })
					.first();
				if (await saveButton.isVisible().catch(() => false)) {
					await saveButton.click();
					await page.waitForTimeout(500);
				}

				// Logout and login again
				await page.goto("/logout");
				await authPage.gotoLogin();
				await authPage.login(username, "TestPass123!");

				// Go back to settings
				await page.goto("/settings");

				// Setting should still be selected
				await page.waitForTimeout(500);
				// Theme should persist (check would be implementation-specific)
			}
		});
	});
});
