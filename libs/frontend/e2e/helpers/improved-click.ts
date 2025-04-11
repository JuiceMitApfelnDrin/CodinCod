import { expect, type Locator } from "@playwright/test";

export async function improvedClick(locator: Locator) {
	await locator.waitFor();
	await expect(locator).toBeEnabled();
	await locator.click();
}
