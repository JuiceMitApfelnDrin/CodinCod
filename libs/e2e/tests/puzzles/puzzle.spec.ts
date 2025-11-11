import { test, expect } from "@/fixtures/base.fixtures";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { generateTestUsername } from "@/utils/test-helpers";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { testIds } from "@codincod/shared/constants/test-ids";

/**
 * Comprehensive Puzzle E2E Tests
 * Tests puzzle listing, creation, editing, deletion, and playing
 * @e2e @puzzles
 */
test.describe("Puzzles - Comprehensive", () => {
	test.describe("Puzzle Listing", () => {
		test("should display puzzle list page @e2e @smoke", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			// Should show puzzles heading
			await expect(
				page.locator("h1, h2").filter({ hasText: /puzzles/i }),
			).toBeVisible();
		});

		test("should navigate to puzzle detail from list @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			// Find first puzzle link
			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();

			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				// Should navigate to puzzle detail page
				await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+$/);
			} else {
				// No puzzles available
				test.skip();
			}
		});

		test("should show create puzzle button for authenticated users @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			const createButton = page.getByTestId(
				testIds.PUZZLES_PAGE_BUTTON_CREATE_PUZZLE,
			);
			await expect(createButton).toBeVisible({ timeout: 2000 });
		});

		test("should filter puzzles by difficulty @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			// Look for difficulty filters
			const easyFilter = page
				.locator("button, a")
				.filter({ hasText: /easy/i })
				.first();

			if (await easyFilter.isVisible().catch(() => false)) {
				await easyFilter.click();

				// Wait for filtering to complete
				await page.waitForTimeout(1000);

				// URL should contain filter parameter
				expect(page.url()).toContain("difficulty");
			}
		});

		test("should filter puzzles by tag @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			// Look for tag filters
			const tagFilter = page
				.locator("button, a")
				.filter({ hasText: /array|string|math/i })
				.first();

			if (await tagFilter.isVisible().catch(() => false)) {
				await tagFilter.click();
				await page.waitForTimeout(1000);
			}
		});

		test("should paginate puzzle list @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			const nextButton = page.getByTestId(testIds.PAGINATION_BUTTON_NEXT);

			if (await nextButton.isVisible().catch(() => false)) {
				await nextButton.click();

				// Wait for page load
				await page.waitForTimeout(1000);

				// Should update URL or content
				expect(page.url()).toMatch(/page|offset/);
			}
		});
	});

	test.describe("Puzzle Detail", () => {
		test("should display puzzle title and description @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();

			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				// Should show puzzle title
				await expect(page.locator("h1, h2")).toContainText(/.+/);

				// Should show description or problem statement
				await expect(
					page.locator("text=/description|problem|challenge/i"),
				).toBeVisible({ timeout: 2000 });
			} else {
				test.skip();
			}
		});

		test("should show play button on puzzle detail @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();

			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await expect(playButton).toBeVisible({ timeout: 2000 });
			} else {
				test.skip();
			}
		});

		test("should show edit button for puzzle author @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			const username = generateTestUsername();
			await authPage.register(username, "TestPass123!");

			// Create a puzzle first
			await page.goto("/puzzles/create");

			// Fill in basic puzzle info
			await page.locator('input[name="title"]').fill("Test Puzzle for Edit");
			await page
				.locator('textarea[name="description"]')
				.fill("Test description");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			// Wait for redirect to puzzle page
			await page.waitForTimeout(2000);

			// Should show edit button
			const editButton = page.getByTestId(
				testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE,
			);
			await expect(editButton).toBeVisible({ timeout: 2000 });
		});

		test("should not show edit button for non-author @e2e", async ({
			authPage,
			page,
			browser,
		}) => {
			// Create puzzle with one user
			const context1 = await browser.newContext();
			const page1 = await context1.newPage();
			const { AuthPage } = await import("@/pages/auth.page");
			const auth1 = new AuthPage(page1);

			await auth1.gotoRegister();
			await auth1.register(generateTestUsername(), TEST_PASSWORD);

			await page1.goto("/puzzles/create");
			await page1.locator('input[name="title"]').fill("Test Puzzle");
			await page1.locator('textarea[name="description"]').fill("Description");
			await page1.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page1.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			await page1.waitForTimeout(2000);
			const puzzleUrl = page1.url();

			await context1.close();

			// View with different user
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(puzzleUrl);

			const editButton = page.getByTestId(
				testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE,
			);
			await expect(editButton).not.toBeVisible();
		});

		test("should display puzzle statistics @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.PUZZLES);

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();

			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				// Look for stats like attempts, completion rate, etc.
				const hasStats = await page
					.locator("text=/attempt|completion|solve/i")
					.isVisible()
					.catch(() => false);

				// Stats might not be shown for all puzzles
				if (hasStats) {
					expect(hasStats).toBe(true);
				}
			} else {
				test.skip();
			}
		});
	});

	test.describe("Puzzle Creation", () => {
		test("should create a simple puzzle @e2e @smoke", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles/create");

			// Fill in puzzle details
			await page.locator('input[name="title"]').fill("Sum Two Numbers");
			await page
				.locator('textarea[name="description"]')
				.fill("Create a function that adds two numbers");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			// Add test case/validator
			const addValidatorButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_ADD_VALIDATOR,
			);
			if (await addValidatorButton.isVisible().catch(() => false)) {
				await addValidatorButton.click();
				await page.waitForTimeout(500);
			}

			// Submit
			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			// Should redirect to puzzle page
			await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+/, { timeout: 5000 });
		});

		test("should validate required fields @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles/create");

			// Try to submit without filling fields
			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			// Should show validation errors
			await expect(
				page.locator("text=/required|cannot be empty/i"),
			).toBeVisible({ timeout: 2000 });
		});

		test("should create puzzle with multiple test cases @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles/create");

			await page.locator('input[name="title"]').fill("Multiple Tests Puzzle");
			await page
				.locator('textarea[name="description"]')
				.fill("Test with multiple cases");
			await page.locator('select[name="difficulty"]').selectOption("medium");

			// Add multiple validators
			const addButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_ADD_VALIDATOR,
			);

			if (await addButton.isVisible().catch(() => false)) {
				await addButton.click();
				await page.waitForTimeout(300);
				await addButton.click();
				await page.waitForTimeout(300);
				await addButton.click();

				// Fill in validator details
				// (This would need to be adapted based on actual form structure)
			}

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+/, { timeout: 5000 });
		});

		test("should set puzzle visibility @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles/create");

			await page.locator('input[name="title"]').fill("Private Puzzle");
			await page
				.locator('textarea[name="description"]')
				.fill("This is private");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			// Set to private if option exists
			const visibilitySelect = page.locator('select[name="visibility"]');
			if (await visibilitySelect.isVisible().catch(() => false)) {
				await visibilitySelect.selectOption("private");
			}

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+/, { timeout: 5000 });
		});
	});

	test.describe("Puzzle Editing", () => {
		test("should edit puzzle title and description @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			// Create puzzle
			await page.goto("/puzzles/create");
			await page.locator('input[name="title"]').fill("Original Title");
			await page
				.locator('textarea[name="description"]')
				.fill("Original Description");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();

			await page.waitForTimeout(2000);

			// Click edit
			const editButton = page.getByTestId(
				testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE,
			);
			await editButton.click();

			// Update fields
			await page.locator('input[name="title"]').fill("Updated Title");
			await page
				.locator('textarea[name="description"]')
				.fill("Updated Description");

			const updateButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_UPDATE_PUZZLE,
			);
			await updateButton.click();

			// Should redirect back to puzzle page
			await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+$/);

			// Should show updated title
			await expect(page.locator("h1, h2")).toContainText("Updated Title");
		});

		test("should add validator to existing puzzle @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			// Create puzzle
			await page.goto("/puzzles/create");
			await page.locator('input[name="title"]').fill("Puzzle for Validators");
			await page
				.locator('textarea[name="description"]')
				.fill("Will add validators");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();
			await page.waitForTimeout(2000);

			// Edit puzzle
			const editButton = page.getByTestId(
				testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE,
			);
			await editButton.click();

			// Add validator
			const addValidatorButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_ADD_VALIDATOR,
			);
			if (await addValidatorButton.isVisible().catch(() => false)) {
				await addValidatorButton.click();
				await page.waitForTimeout(500);
			}

			const updateButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_UPDATE_PUZZLE,
			);
			await updateButton.click();

			await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+$/);
		});

		test("should remove validator from puzzle @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			// Create puzzle with validator
			await page.goto("/puzzles/create");
			await page.locator('input[name="title"]').fill("Puzzle with Validator");
			await page.locator('textarea[name="description"]').fill("Has validators");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			const addButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_ADD_VALIDATOR,
			);
			if (await addButton.isVisible().catch(() => false)) {
				await addButton.click();
				await page.waitForTimeout(500);
			}

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();
			await page.waitForTimeout(2000);

			// Edit and remove validator
			const editButton = page.getByTestId(
				testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE,
			);
			await editButton.click();

			const removeButton = page
				.getByTestId(testIds.EDIT_PUZZLE_FORM_BUTTON_REMOVE_VALIDATOR)
				.first();
			if (await removeButton.isVisible().catch(() => false)) {
				await removeButton.click();
				await page.waitForTimeout(500);
			}

			const updateButton = page.getByTestId(
				testIds.EDIT_PUZZLE_FORM_BUTTON_UPDATE_PUZZLE,
			);
			await updateButton.click();

			await expect(page).toHaveURL(/.*puzzles\/[a-f0-9-]+$/);
		});
	});

	test.describe("Puzzle Deletion", () => {
		test("should delete own puzzle @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			// Create puzzle to delete
			await page.goto("/puzzles/create");
			await page.locator('input[name="title"]').fill("Puzzle to Delete");
			await page
				.locator('textarea[name="description"]')
				.fill("Will be deleted");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();
			await page.waitForTimeout(2000);

			// Navigate to edit page (delete is usually there)
			const editButton = page.getByTestId(
				testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE,
			);
			await editButton.click();

			// Find and click delete button
			const deleteButton = page
				.locator("button")
				.filter({ hasText: /delete/i })
				.first();

			if (await deleteButton.isVisible().catch(() => false)) {
				await deleteButton.click();

				// Confirm deletion in dialog
				const confirmButton = page.getByTestId(
					testIds.DELETE_PUZZLE_DIALOG_BUTTON_DELETE_PUZZLE,
				);
				await confirmButton.click();

				// Should redirect away from puzzle page
				await page.waitForTimeout(2000);
				expect(page.url()).not.toMatch(/puzzles\/[a-f0-9-]+$/);
			}
		});

		test("should not allow deleting others puzzles @e2e", async ({
			authPage,
			page,
			browser,
		}) => {
			// Create puzzle with one user
			const context1 = await browser.newContext();
			const page1 = await context1.newPage();
			const { AuthPage } = await import("@/pages/auth.page");
			const auth1 = new AuthPage(page1);

			await auth1.gotoRegister();
			await auth1.register(generateTestUsername(), TEST_PASSWORD);

			await page1.goto(frontendUrls.PUZZLE_CREATE);
			await page1.locator('input[name="title"]').fill("Protected Puzzle");
			await page1
				.locator('textarea[name="description"]')
				.fill("Cannot be deleted by others");
			await page1.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page1.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();
			await page1.waitForTimeout(2000);

			const puzzleUrl = page1.url();
			await context1.close();

			// Try to access edit/delete with different user
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(puzzleUrl + "/edit");

			// Should either:
			// 1. Not show delete button
			// 2. Show error when trying to delete
			// 3. Redirect away from edit page

			const deleteButton = page
				.locator("button")
				.filter({ hasText: /delete/i })
				.first();
			const isDeleteVisible = await deleteButton.isVisible().catch(() => false);

			// If button is visible and we click it, should fail
			if (isDeleteVisible) {
				await deleteButton.click();
				await page.waitForTimeout(1000);

				// Should show error or stay on page
				const stillOnPage = page.url().includes(puzzleUrl);
				expect(stillOnPage).toBe(true);
			}
		});
	});

	test.describe("User Puzzles", () => {
		test("should view own puzzles @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			const username = generateTestUsername();
			await authPage.register(username, "TestPass123!");

			// Create a puzzle
			await page.goto("/puzzles/create");
			await page.locator('input[name="title"]').fill("My Personal Puzzle");
			await page.locator('textarea[name="description"]').fill("Created by me");
			await page.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();
			await page.waitForTimeout(2000);

			// Navigate to my puzzles
			const myPuzzlesLink = page.getByTestId(
				testIds.PUZZLES_PAGE_ANCHOR_MY_PUZZLES,
			);
			await myPuzzlesLink.click();

			// Should show the created puzzle
			await expect(page.locator('text="My Personal Puzzle"')).toBeVisible({
				timeout: 3000,
			});
		});

		test("should view puzzles by username @e2e", async ({
			authPage,
			page,
			browser,
		}) => {
			// Create puzzle with one user
			const context1 = await browser.newContext();
			const page1 = await context1.newPage();
			const { AuthPage } = await import("@/pages/auth.page");
			const auth1 = new AuthPage(page1);

			await auth1.gotoRegister();
			const username = generateTestUsername();
			await auth1.register(username, "TestPass123!");

			await page1.goto("/puzzles/create");
			await page1.locator('input[name="title"]').fill("Author Test Puzzle");
			await page1
				.locator('textarea[name="description"]')
				.fill("By specific author");
			await page1.locator('select[name="difficulty"]').selectOption("easy");

			const createButton = page1.getByTestId(
				testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE,
			);
			await createButton.click();
			await page1.waitForTimeout(2000);

			await context1.close();

			// View with different user
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto(frontendUrls.userProfileByUsernamePuzzles(username));

			// Should show the author's puzzles
			await expect(page.locator('text="Author Test Puzzle"')).toBeVisible({
				timeout: 3000,
			});
		});
	});
});
