import { Locator, Page } from "@playwright/test";
import { buildFrontendUrl, frontendUrls } from "types";
import { pageChanged } from "../helpers/page-changed";
import { testIds } from "../../src/lib/config/test-ids";
import { PaginationComponent } from "../helpers/components/pagination";
import { improvedClick } from "../helpers/improved-click";

export class PuzzlesDetailPage {
	page: Page;
	pagination: PaginationComponent;

	playPuzzleButton: Locator;
	editPuzzleButton: Locator;

	constructor(page: Page) {
		this.page = page;

		this.pagination = new PaginationComponent(this.page);

		this.playPuzzleButton = page.getByTestId(testIds.PUZZLE_DETAIL_PAGE_PLAY_ANCHOR);
		this.editPuzzleButton = page.getByTestId(testIds.PUZZLE_DETAIL_PAGE_EDIT_ANCHOR);
	}

	async goto(id: string) {
		const puzzlePlayPage = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID, { id });

		await this.page.goto(puzzlePlayPage);
		await pageChanged(this.page, puzzlePlayPage);
	}

	async gotoPlayPuzzle() {
		await improvedClick(this.playPuzzleButton);
		await pageChanged(this.page);
	}

	async gotoEditPuzzle() {
		await improvedClick(this.editPuzzleButton);
		await pageChanged(this.page);
	}
}
