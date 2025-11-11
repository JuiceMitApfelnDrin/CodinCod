import { test as teardown } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

teardown("cleanup auth", async () => {
	// Clean up auth file
	if (fs.existsSync(authFile)) {
		fs.unlinkSync(authFile);
	}
});
