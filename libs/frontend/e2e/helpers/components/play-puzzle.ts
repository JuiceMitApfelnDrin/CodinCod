import { Locator, Page } from "@playwright/test";
import { testIds } from "../../../src/lib/config/test-ids";
import { pageChanged } from "../page-changed";
import { frontendUrls } from "types";
import { improvedClick } from "../improved-click";

export class PlayPuzzleComponent {
	page: Page;

	languageSelect: Locator;
	languageSelectButton: Locator;

	constructor(page: Page) {
		this.page = page;

		this.languageSelect = page.getByTestId(testIds.PUZZLE_PLAY_CHOOSE_LANGUAGE);
		this.languageSelectButton = page.getByTestId(testIds.PUZZLE_PLAY_OPEN_LANGUAGE_SELECT);
		page.getByTestId(testIds.PUZZLE_PLAY_RUN_ALL_TESTS)
	}

	async openLanguageSelect() {
		// Click language select button
		await improvedClick(this.languageSelectButton);
	}

	async chooseLanguage(language: string) {
		// Choose language from dropdown
		await this.languageSelect.selectOption(language);
	}

	async runAllTests() {
		// Click run all tests button
		await this.;
	}

	async submitCode() {
		// Click submit code button
		await this.page.getByTestId(testIds.PUZZLE_PLAY_SUBMIT_CODE).click();
	}

	async runSingleTest(index: number) {
		// Click specific test button. Id appended with index.
		await this.page.getByTestId(`${testIds.PUZZLE_PLAY_RUN_SINGLE_TEST}_${index}`).click();
	}

	async fillCode(code: string) {
		// Fill code editor
		await this.page.getByTestId(testIds.PUZZLE_PLAY_CODE_EDITOR).fill(code);
	}
}
