import { test, expect } from "@playwright/test";
import { improvedClick } from "../helpers/improved-click";
import { LoginPage } from "../pages/login-page";
import { user } from "../config/user";

test.beforeEach(async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.loginWithUsernameAndPassword(user.username, user.password);
});

test("can click play", async ({ page }) => {
	const playLink = page.getByRole("link", { name: "Play" });
	await improvedClick(playLink);

	const h1 = page.getByRole("heading", { name: "Multiplayer" });
	await h1.waitFor();
	await expect(h1).toBeVisible();
});
