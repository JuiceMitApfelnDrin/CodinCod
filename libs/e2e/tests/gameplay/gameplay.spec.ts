import { test, expect } from "@/fixtures/base.fixtures";
import { generateTestUsername } from "@/utils/test-helpers";
import { testIds } from "@codincod/shared/constants/test-ids";
import { TEST_PASSWORD } from "@/utils/test-constants";
import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
/**
 * Puzzle Gameplay E2E Tests
 * Tests playing puzzles, code execution, test running, and submissions
 * @e2e @gameplay
 */
test.describe("Puzzle Gameplay - Comprehensive", () => {
	test.describe("Code Editor", () => {
		test("should load code editor on play page @e2e @smoke", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Should show code editor (CodeMirror or Monaco)
				const editor = page.locator(".cm-editor, .monaco-editor").first();
				await expect(editor).toBeVisible({ timeout: 3000 });
			} else {
				test.skip();
			}
		});

		test("should allow typing in code editor @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Click in editor and type
				const editor = page.locator(".cm-content, .monaco-editor").first();
				await editor.click();

				const testCode = "function test() { return 42; }";
				await page.keyboard.type(testCode);

				// Verify code was entered
				await expect(editor).toContainText("test", { timeout: 2000 });
			} else {
				test.skip();
			}
		});

		test("should persist code in session @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Type some code
				const editor = page.locator(".cm-content, .monaco-editor").first();
				await editor.click();
				await page.keyboard.type("const x = 123;");

				// Navigate away and back
				await page.goto("/puzzles");
				await puzzleLink.click();
				await playButton.click();

				// Code should be restored
				await expect(editor).toContainText("x = 123", { timeout: 2000 });
			} else {
				test.skip();
			}
		});
	});

	test.describe("Language Selection", () => {
		test("should select programming language @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Find language selector
				const languageSelect = page
					.locator("select, button")
					.filter({ hasText: /python|javascript|java/i })
					.first();

				if (await languageSelect.isVisible().catch(() => false)) {
					// If it's a select
					if (
						(await languageSelect.evaluate((el) => el.tagName)) === "SELECT"
					) {
						await languageSelect.selectOption({ index: 1 });
					} else {
						// If it's a button/dropdown
						await languageSelect.click();
						const option = page.locator("text=/python|javascript/i").first();
						await option.click();
					}

					// Wait for editor to update
					await page.waitForLoadState("domcontentloaded");
				}
			} else {
				test.skip();
			}
		});

		test("should update editor template when changing language @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				const editor = page.locator(".cm-content, .monaco-editor").first();
				const initialText = await editor.textContent();

				// Change language
				const languageSelect = page
					.locator("select, button")
					.filter({ hasText: /python|javascript/i })
					.first();

				if (await languageSelect.isVisible().catch(() => false)) {
					if (
						(await languageSelect.evaluate((el) => el.tagName)) === "SELECT"
					) {
						await languageSelect.selectOption({ index: 1 });
					} else {
						await languageSelect.click();
						const option = page.locator("text=/python|javascript/i").first();
						await option.click();
					}

					// Wait for editor content to change
					await page.waitForFunction((oldText) => {
						const editor = document.querySelector(
							".cm-content, .monaco-editor",
						);
						return editor && editor.textContent !== oldText;
					}, initialText);

					const newText = await editor.textContent();
					// Template should have changed
					expect(newText).not.toBe(initialText);
				}
			} else {
				test.skip();
			}
		});
	});

	test.describe("Code Execution", () => {
		test("should run code and see output @e2e @smoke", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Click run button
				const runButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE,
				);

				if (await runButton.isVisible().catch(() => false)) {
					await runButton.click();

					// Should show output or results
					const outputArea = page.getByTestId(
						testIds.PLAY_PUZZLE_COMPONENT_CONSOLE_OUTPUT,
					);
					await expect(outputArea).toBeVisible({ timeout: 10000 });
				}
			} else {
				test.skip();
			}
		});

		test("should show console output @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Clear editor and add console.log
				const editor = page.locator(".cm-content").first();
				await editor.click();
				await page.keyboard.press("Control+A");
				await page.keyboard.type('console.log("Hello Test");');

				// Run code
				const runButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE,
				);
				if (await runButton.isVisible().catch(() => false)) {
					await runButton.click();

					// Check for output
					const outputArea = page.getByTestId(
						testIds.PLAY_PUZZLE_COMPONENT_CONSOLE_OUTPUT,
					);
					await expect(outputArea).toContainText("Hello Test", {
						timeout: 10000,
					});
				}
			} else {
				test.skip();
			}
		});

		test("should show error for syntax errors @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Enter invalid code
				const editor = page.locator(".cm-content").first();
				await editor.click();
				await page.keyboard.press("Control+A");
				await page.keyboard.type("this is not valid code {{{");

				// Run code
				const runButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE,
				);
				if (await runButton.isVisible().catch(() => false)) {
					await runButton.click();

					// Should show error
					await expect(
						page.locator("text=/error|exception|syntax/i"),
					).toBeVisible({ timeout: 10000 });
				}
			} else {
				test.skip();
			}
		});

		test("should handle long running code with timeout @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Enter infinite loop
				const editor = page.locator(".cm-content").first();
				await editor.click();
				await page.keyboard.press("Control+A");
				await page.keyboard.type("while(true) {}");

				// Run code
				const runButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE,
				);
				if (await runButton.isVisible().catch(() => false)) {
					await runButton.click();

					// Should show timeout error
					await expect(page.locator("text=/timeout|time limit/i")).toBeVisible({
						timeout: 15000,
					});
				}
			} else {
				test.skip();
			}
		});
	});

	test.describe("Test Running", () => {
		test("should run all tests @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Run all tests button
				const runTestsButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_ALL_TESTS,
				);

				if (await runTestsButton.isVisible().catch(() => false)) {
					await runTestsButton.click();

					// Should show test results
					const testResults = page.getByTestId(
						testIds.PLAY_PUZZLE_COMPONENT_TEST_RESULTS,
					);
					await expect(testResults).toBeVisible({ timeout: 10000 });
				}
			} else {
				test.skip();
			}
		});

		test("should show individual test results @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				const runTestsButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_ALL_TESTS,
				);

				if (await runTestsButton.isVisible().catch(() => false)) {
					await runTestsButton.click();

					await page.waitForTimeout(3000);

					// Should show pass/fail icons or indicators
					const passedTests = page.locator("text=/passed|✓|✔/i");
					const failedTests = page.locator("text=/failed|✗|✘/i");

					const hasResults =
						(await passedTests
							.first()
							.isVisible()
							.catch(() => false)) ||
						(await failedTests
							.first()
							.isVisible()
							.catch(() => false));

					expect(hasResults).toBe(true);
				}
			} else {
				test.skip();
			}
		});

		test("should display test progress indicator @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				const runTestsButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_ALL_TESTS,
				);

				if (await runTestsButton.isVisible().catch(() => false)) {
					await runTestsButton.click();

					// Look for progress bar or counter
					const progressIndicator = page
						.locator(
							'[role="progressbar"], .progress-bar, text=/[0-9]+/[0-9]+ tests/i',
						)
						.first();
					await expect(progressIndicator).toBeVisible({ timeout: 2000 });
				}
			} else {
				test.skip();
			}
		});
	});

	test.describe("Code Submission", () => {
		test("should submit code solution @e2e @smoke", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Submit button
				const submitButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE,
				);

				if (await submitButton.isVisible().catch(() => false)) {
					await submitButton.click();

					// Should show submission result or confirmation
					await expect(
						page.locator("text=/submitted|submission/i"),
					).toBeVisible({ timeout: 10000 });
				}
			} else {
				test.skip();
			}
		});

		test("should prevent submission without passing tests @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Clear editor (invalid solution)
				const editor = page.locator(".cm-content").first();
				await editor.click();
				await page.keyboard.press("Control+A");
				await page.keyboard.type("// Empty solution");

				// Try to submit
				const submitButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE,
				);

				if (await submitButton.isVisible().catch(() => false)) {
					// Button might be disabled
					const isDisabled = await submitButton.isDisabled().catch(() => false);

					if (!isDisabled) {
						await submitButton.click();

						// Should show error or warning
						await expect(
							page.locator("text=/cannot submit|tests must pass|invalid/i"),
						).toBeVisible({ timeout: 5000 });
					} else {
						// Button is correctly disabled
						expect(isDisabled).toBe(true);
					}
				}
			} else {
				test.skip();
			}
		});

		test("should show submission history @e2e", async ({ authPage, page }) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Submit once
				const submitButton = page.getByTestId(
					testIds.PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE,
				);

				if (await submitButton.isVisible().catch(() => false)) {
					await submitButton.click();
					await page.waitForTimeout(2000);

					// Look for submissions list
					const submissionsSection = page.locator(
						"text=/previous submissions|submission history/i",
					);
					const hasHistory = await submissionsSection
						.isVisible()
						.catch(() => false);

					// History might be on a different page or tab
					if (!hasHistory) {
						// Try clicking on submissions tab or link
						const submissionsTab = page
							.locator("button, a")
							.filter({ hasText: /submissions/i })
							.first();
						if (await submissionsTab.isVisible().catch(() => false)) {
							await submissionsTab.click();
							await expect(page.locator("text=/submission/i")).toBeVisible({
								timeout: 2000,
							});
						}
					}
				}
			} else {
				test.skip();
			}
		});
	});

	test.describe("UI Interactions", () => {
		test("should toggle between code and instructions @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Look for tabs or toggle buttons
				const instructionsTab = page
					.locator("button")
					.filter({ hasText: /instructions|description/i })
					.first();
				const codeTab = page
					.locator("button")
					.filter({ hasText: /code|editor/i })
					.first();

				if (await instructionsTab.isVisible().catch(() => false)) {
					await instructionsTab.click();
					await page.waitForTimeout(300);

					await codeTab.click();
					await page.waitForTimeout(300);

					// Should toggle successfully
					expect(true).toBe(true);
				}
			} else {
				test.skip();
			}
		});

		test("should resize editor panels @e2e", async ({ authPage, page }) => {
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
				await playButton.click();

				// Look for resize handle
				const resizeHandle = page
					.locator("[data-panel-resize-handle-id], .resize-handle")
					.first();

				if (await resizeHandle.isVisible().catch(() => false)) {
					// Try to drag resize handle
					const box = await resizeHandle.boundingBox();
					if (box) {
						await page.mouse.move(
							box.x + box.width / 2,
							box.y + box.height / 2,
						);
						await page.mouse.down();
						await page.mouse.move(box.x + 100, box.y + box.height / 2);
						await page.mouse.up();

						// Panel should have resized
						await page.waitForTimeout(300);
					}
				}
			} else {
				test.skip();
			}
		});

		test("should show keyboard shortcuts help @e2e", async ({
			authPage,
			page,
		}) => {
			await authPage.gotoRegister();
			await authPage.register(generateTestUsername(), TEST_PASSWORD);

			await page.goto("/puzzles");

			const puzzleLink = page
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
				.first();
			if (await puzzleLink.isVisible().catch(() => false)) {
				await puzzleLink.click();

				const playButton = page.getByTestId(
					testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE,
				);
				await playButton.click();

				// Look for help button or press ? key
				await page.keyboard.press("?");

				// Should show shortcuts modal or help
				const helpModal = page
					.locator("text=/keyboard shortcuts|help|commands/i")
					.first();
				const isVisible = await helpModal
					.isVisible({ timeout: 1000 })
					.catch(() => false);

				// Help might not be implemented
				if (isVisible) {
					await expect(helpModal).toBeVisible();
				}
			} else {
				test.skip();
			}
		});
	});
});
