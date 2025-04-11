import { Locator, Page } from "@playwright/test";
import { testIds } from "../../../src/lib/config/test-ids";
import { pageChanged } from "../page-changed";
import { frontendUrls } from "types";
import { improvedClick } from "../improved-click";

export class PaginationComponent {
	page: Page;

	firstButton: Locator;
	previousButton: Locator;
	nextButton: Locator;
	lastButton: Locator;

	constructor(page: Page) {
		this.page = page;

		this.firstButton = page.getByTestId(testIds.PAGINATION_BUTTON_FIRST);
		this.previousButton = page.getByTestId(testIds.PAGINATION_BUTTON_PREVIOUS);
		this.nextButton = page.getByTestId(testIds.PAGINATION_BUTTON_NEXT);
		this.lastButton = page.getByTestId(testIds.PAGINATION_BUTTON_LAST);
	}

	async gotoFirst() {
		await improvedClick(this.firstButton);
		await pageChanged(this.page);
	}

	async gotoPrevious() {
		await improvedClick(this.previousButton);
		await pageChanged(this.page);
	}

	async gotoNext() {
		await improvedClick(this.nextButton);
		await pageChanged(this.page);
	}

	async gotoLast() {
		await improvedClick(this.lastButton);
		await pageChanged(this.page);
	}

	async gotoPage(pageNumber: number, size: number = 20) {
		const puzzlesWithPageNumber = `${frontendUrls.PUZZLES}?page=${pageNumber}&size=${size}`;
		await this.page.goto(puzzlesWithPageNumber);
		await pageChanged(this.page, puzzlesWithPageNumber);
	}
}
