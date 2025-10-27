#!/usr/bin/env node
import { config } from "dotenv";
config();

import {
	connectToDatabase,
	disconnectFromDatabase
} from "../seeds/utils/db-connection.js";
import { MigrationRunner } from "./framework/migration-runner.js";
import { AddProgrammingLanguageEntityMigration } from "./migrations/2025-10-26-add-programming-language-entity.js";
import { MigrateUserRolesToRoleMigration } from "./migrations/2025-10-26-migrate-user-roles-to-role.js";

/**
 * Main migration CLI tool
 *
 * Usage:
 *   pnpm migrate          - Run all pending migrations
 *   pnpm migrate:list     - List all migrations and their status
 *   pnpm migrate:rollback - Rollback the last migration
 */
async function main() {
	const command = process.argv[2] || "run";

	console.log("🔧 CodinCod Migration Tool\n");

	try {
		// Connect to database
		await connectToDatabase();

		// Create migration runner
		const runner = new MigrationRunner();

		// Register all migrations here (in chronological order)
		runner.register(new MigrateUserRolesToRoleMigration());
		runner.register(new AddProgrammingLanguageEntityMigration());

		// Execute command
		switch (command) {
			case "run":
			case "up":
				await runner.runAll();
				break;

			case "list":
			case "status":
				await runner.list();
				break;

			case "rollback":
			case "down":
				await runner.rollbackLast();
				break;

			default:
				console.error(`Unknown command: ${command}`);
				console.log("\nAvailable commands:");
				console.log("  run, up         - Run all pending migrations");
				console.log("  list, status    - List all migrations and their status");
				console.log("  rollback, down  - Rollback the last migration");
				process.exit(1);
		}
	} catch (error) {
		console.error("\n❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await disconnectFromDatabase();
	}
}

main();
