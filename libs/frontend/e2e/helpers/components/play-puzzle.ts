import { Locator, Page } from "@playwright/test";
import { testIds } from "../../../src/lib/config/test-ids";
import { improvedClick } from "../improved-click";
import { LanguageSelectComponent } from "./language-select";

export class PlayPuzzleComponent {
	page: Page;

	languageSelect: LanguageSelectComponent;

	runAllTestsButton: Locator;
	submitCodeButton: Locator;
	runSingleTestButton: Locator;

	constructor(page: Page) {
		this.page = page;

		this.languageSelect = new LanguageSelectComponent(page);

		this.runAllTestsButton = page.getByTestId(testIds.PUZZLE_PLAY_BUTTON_RUN_ALL_TESTS);
		this.submitCodeButton = page.getByTestId(testIds.PUZZLE_PLAY_BUTTON_SUBMIT_CODE);
		this.runSingleTestButton = page.getByTestId(testIds.PUZZLE_PLAY_BUTTON_RUN_SINGLE_TEST);
	}

	async runAllTests() {
		await improvedClick(this.runAllTestsButton);
	}

	async submitCode() {
		await improvedClick(this.submitCodeButton);
	}

	async runSingleTest(index: number) {
		const nthTestToRun = this.runSingleTestButton.nth(index);

		await improvedClick(nthTestToRun);
	}
}
