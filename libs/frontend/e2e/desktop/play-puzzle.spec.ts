import test from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { user } from "../config/user";
import { HomePage } from "../pages/home-page";
import { PuzzlesPage } from "../pages/puzzles-page";
import { puzzleVisibilityEnum } from "types";
import { PuzzlesDetailPage } from "../pages/puzzle-detail-page";

test("logged in user can play a puzzle", async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.loginWithUsernameAndPassword(user.username, user.password);

	const homepage = new HomePage(page);
	await homepage.navigation.gotoPuzzles();

	const puzzlesPage = new PuzzlesPage(page);
	await puzzlesPage.clickFirstPuzzleWithVisibility(puzzleVisibilityEnum.APPROVED);

	const puzzleDetailPage = new PuzzlesDetailPage(page);
	await puzzleDetailPage.gotoPlayPuzzle();
});

test("unable to play when logged out", async ({ page }) => {
	const homepage = new HomePage(page);
	await homepage.goto();
	await homepage.navigation.gotoPuzzles();

	const puzzlesPage = new PuzzlesPage(page);
	await puzzlesPage.clickFirstPuzzleWithVisibility(puzzleVisibilityEnum.APPROVED);

	const puzzleDetailPage = new PuzzlesDetailPage(page);
	await puzzleDetailPage.gotoPlayPuzzle();

	const loginPage = new LoginPage(page);
	await loginPage.isLoginPage();
});
