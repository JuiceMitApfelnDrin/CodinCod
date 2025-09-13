import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { MigrationRunner } from "../migrations/migration-runner.js";
import { allMigrations } from "../migrations/index.js";
import { DEFAULT_DB_NAME } from "@/config/constants.js";

async function checkMigrationStatus() {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME;

	if (!uri) {
		console.error("❌ MONGO_URI is not defined in environment variables");
		process.exit(1);
	}

	try {
		console.log("🔗 Connecting to database...");
		await mongoose.connect(uri, { dbName: dbName ?? DEFAULT_DB_NAME });
		console.log("✅ Connected to database");

		const migrationRunner = new MigrationRunner(mongoose.connection);
		const currentVersion = await migrationRunner.getCurrentVersion();

		console.log(`📊 Migration Status:`);
		console.log(`   Current version: ${currentVersion}`);
		console.log(`   Available migrations: ${allMigrations.length}`);
		console.log(
			`   Latest available: ${Math.max(...allMigrations.map((m) => m.version))}`
		);

		const pendingMigrations = allMigrations.filter(
			(m) => m.version > currentVersion
		);

		if (pendingMigrations.length > 0) {
			console.log(`⏳ Pending migrations (${pendingMigrations.length}):`);
			pendingMigrations.forEach((migration) => {
				console.log(`   - ${migration.version}: ${migration.name}`);
			});
		} else {
			console.log("✅ All migrations are up to date");
		}
	} catch (error) {
		console.error("❌ Failed to check migration status:", error);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log("👋 Disconnected from database");
	}
}

checkMigrationStatus();
