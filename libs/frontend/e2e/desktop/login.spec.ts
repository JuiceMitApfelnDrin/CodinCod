import { expect, test } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { user } from "../config/user";
import { HomePage } from "../pages/home-page";

test("logging in with email works", async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.loginWithEmailAndPassword(user.email, user.password);

	const homePage = new HomePage(page);
	const isLoggedIn = await homePage.navigation.isLoggedIn();
	expect(isLoggedIn).toBe(true);
});

test("logging in with username works", async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.loginWithUsernameAndPassword(user.username, user.password);

	const homePage = new HomePage(page);
	const isLoggedIn = await homePage.navigation.isLoggedIn();
	expect(isLoggedIn).toBe(true);
});
