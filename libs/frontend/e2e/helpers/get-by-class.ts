import { Page } from "@playwright/test";

export function getByClass(page: Page, className: string) {
	return page.locator(`.${className}`);
}
