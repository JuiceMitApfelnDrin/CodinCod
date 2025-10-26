#!/usr/bin/env node

import { config } from "dotenv";
import {
	connectToDatabase,
	disconnectFromDatabase
} from "./utils/db-connection.js";
import {
	clearDatabase,
	getCollectionCounts
} from "./utils/clear-database.js";

config();

/**
 * Script to clear the database
 */
async function clear() {
	console.log("🗑️  Database Clear Utility\n");
	console.log("=".repeat(50));

	try {
		await connectToDatabase();

		// Show current counts
		console.log("\n📊 Current Database Counts:\n");
		const beforeCounts = await getCollectionCounts();
		Object.entries(beforeCounts).forEach(([collection, count]) => {
			console.log(`   ${collection.padEnd(15)}: ${count}`);
		});

		// Clear database (requires confirmation unless --force)
		await clearDatabase(process.argv.includes("--force"));

		// Show final counts
		console.log("\n📊 Final Database Counts:\n");
		const afterCounts = await getCollectionCounts();
		Object.entries(afterCounts).forEach(([collection, count]) => {
			console.log(`   ${collection.padEnd(15)}: ${count}`);
		});

		console.log("\n" + "=".repeat(50));
		console.log("✅ Database clear completed\n");
	} catch (error) {
		console.error("\n❌ Clear operation failed:", error);
		process.exit(1);
	} finally {
		await disconnectFromDatabase();
	}
}

clear();
