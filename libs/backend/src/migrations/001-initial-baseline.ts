import { Migration } from "./migration-runner.js";

export const migration001: Migration = {
	version: 1,
	name: "Initial schema baseline",
	async up(db) {
		if (!db.db) {
			throw new Error("Database connection is not available");
		}

		// This migration establishes the current state as the baseline
		// Future migrations will build upon this

		// Ensure basic indexes exist
		const collections = await db.db.listCollections().toArray();

		if (collections.some((c) => c.name === "users")) {
			await db.db
				.collection("users")
				.createIndex({ email: 1 }, { unique: true });
			await db.db
				.collection("users")
				.createIndex({ username: 1 }, { unique: true });
		}

		if (collections.some((c) => c.name === "puzzles")) {
			await db.db.collection("puzzles").createIndex({ author: 1 });
			await db.db.collection("puzzles").createIndex({ createdAt: -1 });
		}

		if (collections.some((c) => c.name === "submissions")) {
			await db.db.collection("submissions").createIndex({ user: 1 });
			await db.db.collection("submissions").createIndex({ puzzle: 1 });
			await db.db.collection("submissions").createIndex({ createdAt: -1 });
		}

		console.log("✅ Basic indexes established");
	},

	async down(db) {
		console.log("✅ Baseline migration - no rollback needed");
	}
};
