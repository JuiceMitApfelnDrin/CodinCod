import { config } from "dotenv";
config();

import {
	connectToDatabase,
	disconnectFromDatabase
} from "./utils/db-connection.js";
import { clearDatabase, getCollectionCounts } from "./utils/clear-database.js";
import { SeedLogger, getEnvNumber } from "./utils/seed-helpers.js";
import { getSeedCounts } from "./config/seed-presets.js";
import { createUsers } from "./factories/user.factory.js";
import { createPuzzles } from "./factories/puzzle.factory.js";
import { createSubmissions } from "./factories/submission.factory.js";
import { createPuzzleComments } from "./factories/comment.factory.js";
import { createUserBans } from "./factories/user-ban.factory.js";
import { createMultiplePreferences } from "./factories/preferences.factory.js";
import { createReports } from "./factories/report.factory.js";
import { createGames } from "./factories/game.factory.js";
import { createChatMessages } from "./factories/chat-message.factory.js";
import { createUserVotes } from "./factories/user-vote.factory.js";
import { userRole } from "types";
import User from "../models/user/user.js";
import Game from "../models/game/game.js";
import { Types } from "mongoose";
import { seedProgrammingLanguages } from "./programming-language.seed.js";

async function seed() {
	console.log("🌱 Starting database seeding...\n");
	console.log("=".repeat(50));

	try {
		// Connect to database
		await connectToDatabase();

		// Clear existing data
		await clearDatabase(process.argv.includes("--force"));

		// Seed programming languages from Piston (must be first!)
		const langLogger = new SeedLogger(
			"Seeding programming languages from Piston"
		);
		const programmingLanguages = await seedProgrammingLanguages();
		langLogger.success(programmingLanguages.length, "programming languages");

		// Get seed counts from environment or preset
		const seedCounts = getSeedCounts(getEnvNumber);
		const presetName = process.env.SEED_PRESET || "standard";

		console.log("\n📊 Seed Configuration:");
		console.log(`   Preset: ${presetName.toUpperCase()}`);
		console.log(`   Users: ${seedCounts.users}`);
		console.log(`   Puzzles: ${seedCounts.puzzles}`);
		console.log(
			`   Submissions: ~${seedCounts.puzzles * seedCounts.submissionsPerPuzzle}`
		);
		console.log(
			`   Comments: ~${seedCounts.puzzles * seedCounts.commentsPerPuzzle}`
		);
		console.log(`   Reports: ${seedCounts.reports}`);
		console.log(`   Games: ${seedCounts.games}\n`);

		// 1. Create Users (admin, moderators, regular users)
		const userLogger = new SeedLogger("Creating users");
		const userIds = await createUsers(seedCounts.users);
		userLogger.success(userIds.length, "users");

		// 2. Create Preferences for users
		const prefLogger = new SeedLogger("Creating user preferences");
		const preferencesIds = await createMultiplePreferences(userIds);
		prefLogger.success(preferencesIds.length, "preferences");

		// Get moderator IDs for later use
		const moderators = await User.find({ role: userRole.MODERATOR }).lean();
		const moderatorIds = moderators.map(
			(mod) => mod._id as unknown as Types.ObjectId
		);

		// 3. Create User Bans
		const banLogger = new SeedLogger("Creating user bans");
		const banIds = await createUserBans(userIds, moderatorIds);
		banLogger.success(banIds.length, "user bans");

		// 4. Create Puzzles
		const puzzleLogger = new SeedLogger("Creating puzzles");
		const puzzleIds = await createPuzzles(seedCounts.puzzles, userIds);
		puzzleLogger.success(puzzleIds.length, "puzzles");

		// 5. Create Submissions
		const submissionLogger = new SeedLogger("Creating submissions");
		const submissionCount =
			seedCounts.puzzles * seedCounts.submissionsPerPuzzle;
		const submissionIds = await createSubmissions(
			submissionCount,
			userIds,
			puzzleIds
		);
		submissionLogger.success(submissionIds.length, "submissions");

		// 6. Create Comments (with nested replies)
		const commentLogger = new SeedLogger("Creating comments");
		const commentCount = seedCounts.puzzles * seedCounts.commentsPerPuzzle;
		const commentIds = await createPuzzleComments(
			commentCount,
			userIds,
			puzzleIds
		);
		commentLogger.success(commentIds.length, "comments (+ nested replies)");

		// 7. Create Reports
		const reportLogger = new SeedLogger("Creating reports");
		const reportIds = await createReports(
			seedCounts.reports,
			userIds,
			puzzleIds,
			moderatorIds
		);
		reportLogger.success(reportIds.length, "reports");

		// 8. Create Games
		const gameLogger = new SeedLogger("Creating games");
		const gameIds = await createGames(seedCounts.games, userIds, puzzleIds);
		gameLogger.success(gameIds.length, "games");

		// 9. Create Chat Messages for Games
		const chatLogger = new SeedLogger("Creating chat messages");
		// Build a map of game IDs to player IDs
		const games = await Game.find({ _id: { $in: gameIds } }).lean();
		const gamePlayerMap = new Map<string, Types.ObjectId[]>();
		games.forEach((game) => {
			gamePlayerMap.set(
				game._id.toString(),
				game.players as unknown as Types.ObjectId[]
			);
		});
		const chatMessageIds = await createChatMessages(gameIds, gamePlayerMap);
		chatLogger.success(chatMessageIds.length, "chat messages");

		// 10. Create User Votes
		const voteLogger = new SeedLogger("Creating user votes");
		const voteIds = await createUserVotes(commentIds, userIds);
		voteLogger.success(voteIds.length, "user votes");

		// Display final counts
		console.log("\n" + "=".repeat(50));
		console.log("📈 Final Database Counts:\n");

		const counts = await getCollectionCounts();
		Object.entries(counts).forEach(([collection, count]) => {
			console.log(`   ${collection.padEnd(15)}: ${count}`);
		});

		console.log("\n" + "=".repeat(50));
		console.log("✨ Seeding completed successfully!\n");
	} catch (error) {
		console.error("\n❌ Seeding failed:", error);
		process.exit(1);
	} finally {
		await disconnectFromDatabase();
	}
}

seed();
