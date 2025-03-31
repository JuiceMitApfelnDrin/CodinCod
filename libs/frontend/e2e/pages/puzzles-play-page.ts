import { Page } from "@playwright/test";
import { buildFrontendUrl, frontendUrls } from "types";
import { pageChanged } from "../helpers/page-changed";

export class PuzzlesPlayPage {
	page: Page;
	// passwordInput: Locator;
	// identifierInput: Locator;
	// loginButton: Locator;

	constructor(page: Page) {
		this.page = page;

		// this.identifierInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_IDENTIFIER);
		// this.passwordInput = page.getByTestId(testIds.LOGIN_FORM_INPUT_PASSWORD);
		// this.loginButton = page.getByTestId(testIds.LOGIN_FORM_BUTTON_LOGIN);
	}

	async goto(id: string) {
		const puzzlePlayPage = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id });

		await this.page.goto(puzzlePlayPage);
		await pageChanged(this.page, puzzlePlayPage);
	}
}
