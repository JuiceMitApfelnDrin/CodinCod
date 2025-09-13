import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { MigrationRunner } from "../migrations/migration-runner.js";
import { allMigrations } from "../migrations/index.js";
import { DEFAULT_DB_NAME } from "@/config/constants.js";

async function runMigrations() {
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
		await migrationRunner.runMigrations(allMigrations);

		console.log("🎉 Migration process completed");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log("👋 Disconnected from database");
	}
}

runMigrations();
