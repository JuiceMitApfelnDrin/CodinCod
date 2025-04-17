import { Locator, Page } from "@playwright/test";
import { testIds } from "../../../src/lib/config/test-ids";
import { pageChanged } from "../page-changed";
import { frontendUrls } from "types";
import { improvedClick } from "../improved-click";

export class LanguageSelectComponent {
	page: Page;

	openSelectButton: Locator;
	optionLanguage: Locator;

	constructor(page: Page) {
		this.page = page;

		this.openSelectButton = page.getByTestId(testIds.LANGUAGE_SELECT_BUTTON_OPEN_LANGUAGE_SELECT);
		this.optionLanguage = page.getByTestId(testIds.LANGUAGE_SELECT_OPTION_LANGUAGE);
	}

	async clickSelectOpen() {
		await improvedClick(this.openSelectButton);
	}

	async chooseLanguage(language: string) {
		const languageOptionInSelect = this.optionLanguage.getByText(language);
		await improvedClick(languageOptionInSelect);
	}

	async gotoPage(pageNumber: number, size: number = 20) {
		const puzzlesWithPageNumber = `${frontendUrls.PUZZLES}?page=${pageNumber}&size=${size}`;
		await this.page.goto(puzzlesWithPageNumber);
		await pageChanged(this.page, puzzlesWithPageNumber);
	}
}
