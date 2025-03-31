import { Locator, Page } from "@playwright/test";
import { testIds } from "../../../src/lib/config/test-ids";
import { pageChanged } from "../page-changed";
import { frontendUrls } from "types";
import { improvedClick } from "../improved-click";

export class PlayPuzzleComponent {
	page: Page;

	// lastButton: Locator;

	constructor(page: Page) {
		this.page = page;

		// this.firstButton = page.getByTestId(testIds.NAVIGATION_MENU_ANCHOR_SETTINGS);
	}
}
