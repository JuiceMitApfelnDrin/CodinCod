import { Page } from "@playwright/test";
import { frontendUrls } from "types";
import { pageChanged } from "../helpers/page-changed";
import { NavigationComponent } from "../helpers/components/navigation";

export class HomePage {
	page: Page;
	navigation: NavigationComponent;

	constructor(page: Page) {
		this.page = page;

		this.navigation = new NavigationComponent(page);
	}

	async goto() {
		await this.page.goto(frontendUrls.ROOT);
		await pageChanged(this.page, frontendUrls.ROOT);
	}
}
