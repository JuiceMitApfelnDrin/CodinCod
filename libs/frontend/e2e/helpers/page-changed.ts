import type { Page } from "@playwright/test";
import { FrontendUrl } from "types";

export async function pageChanged(page: Page, url?: FrontendUrl | string) {
	await page.waitForLoadState("networkidle");

	if (url) {
		await page.waitForURL(url);
	}
}
