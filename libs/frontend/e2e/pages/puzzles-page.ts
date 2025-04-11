import { Locator, Page } from "@playwright/test";
import { frontendUrls, PuzzleVisibility } from "types";
import { pageChanged } from "../helpers/page-changed";
import { testIds } from "../../src/lib/config/test-ids";
import { PaginationComponent } from "../helpers/components/pagination";
import { improvedClick } from "../helpers/improved-click";

export class PuzzlesPage {
	page: Page;
	pagination: PaginationComponent;

	createPuzzleButton: Locator;

	linksToPuzzles: Locator;

	constructor(page: Page) {
		this.page = page;

		this.pagination = new PaginationComponent(this.page);

		this.linksToPuzzles = page.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE);
		this.createPuzzleButton = page.getByTestId(testIds.PUZZLES_PAGE_BUTTON_CREATE_PUZZLE);
	}

	async goto() {
		await this.page.goto(frontendUrls.PUZZLES);
		await pageChanged(this.page, frontendUrls.PUZZLES);
	}

	async clickFirstPuzzleWithVisibility(type: PuzzleVisibility) {
		await improvedClick(
			this.getPuzzleRows()
				.filter({ hasText: type })
				.first()
				.getByTestId(testIds.PUZZLES_PAGE_ANCHOR_PUZZLE)
		);
		await pageChanged(this.page);
	}

	private getPuzzleRows() {
		return this.page.locator("tr");
	}
}
