import { Locator, Page } from "@playwright/test";
import { buildFrontendUrl, frontendUrls } from "types";
import { pageChanged } from "../helpers/page-changed";
import { testIds } from "../../src/lib/config/test-ids";
import { PlayPuzzleComponent } from "../helpers/components/play-puzzle";

export class PuzzlePlayPage {
	page: Page;
	playPuzzle: PlayPuzzleComponent;

	puzzlePlayContainer: Locator;

	constructor(page: Page) {
		this.page = page;

		this.playPuzzle = new PlayPuzzleComponent(page);

		this.puzzlePlayContainer = page.getByTestId(testIds.PUZZLE_PLAY_PAGE_CONTAINER);
	}

	async goto(id: string) {
		const puzzlePlayPage = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id });

		await this.page.goto(puzzlePlayPage);
		await pageChanged(this.page, puzzlePlayPage);
	}

	async isPuzzlePlayPage() {
		return await this.puzzlePlayContainer.isVisible();
	}
}
