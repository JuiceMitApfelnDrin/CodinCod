import { config } from "dotenv";
config();

import {
	connectToDatabase,
	disconnectFromDatabase
} from "../seeds/utils/db-connection.js";
import ProgrammingLanguage from "../models/programming-language/language.js";
import Submission from "../models/submission/submission.js";
import Puzzle from "../models/puzzle/puzzle.js";
import Game from "../models/game/game.js";
import {
	arePistonRuntimes,
	httpRequestMethod,
	isString,
	PistonRuntime,
	pistonUrls
} from "types";
import { buildPistonUri } from "@/utils/functions/build-piston-uri.js";

interface OldSubmission {
	_id: any;
	language?: string;
	languageVersion?: string;
	programmingLanguage?: string;
}

interface OldPuzzleSolution {
	language?: string;
	languageVersion?: string;
	programmingLanguage?: string;
	code?: string;
	explanation?: string;
}

interface OldPuzzle {
	_id: any;
	solution?: OldPuzzleSolution;
}

interface OldGameLanguage {
	language: string;
	version: string;
	aliases?: string[];
	runtime?: string;
}

interface OldGame {
	_id: any;
	options?: {
		allowedLanguages?: (string | OldGameLanguage)[];
	};
}

/**
 * Migration script to:
 * 1. Fetch programming languages from Piston
 * 2. Create ProgrammingLanguage documents
 * 3. Migrate existing data (Submissions, Puzzles/Solutions, Games) to reference ProgrammingLanguage ObjectIds
 */
async function migrate() {
	console.log("🔄 Starting migration to ProgrammingLanguage entity...\n");
	console.log("=".repeat(50));

	try {
		await connectToDatabase();

		// Step 1: Fetch Piston runtimes
		console.log("\n📡 Fetching available runtimes from Piston...");
		const response = await fetch(buildPistonUri(pistonUrls.RUNTIMES), {
			method: httpRequestMethod.GET,
			headers: {
				"Content-Type": "application/json"
			}
		});
		const runtimes = await response.json();

		if (!arePistonRuntimes(runtimes)) {
			throw new Error("Failed to fetch valid Piston runtimes");
		}

		console.log(`✓ Found ${runtimes.length} runtimes from Piston`);

		// Step 2: Create ProgrammingLanguage documents
		console.log("\n🗄️  Creating ProgrammingLanguage documents...");

		// Check if ProgrammingLanguages already exist
		const existingCount = await ProgrammingLanguage.countDocuments({});
		if (existingCount > 0) {
			console.log(
				`   ⚠️  Found ${existingCount} existing programming languages`
			);
			console.log("   ℹ️  Skipping recreation to preserve existing references");
			console.log(
				"   💡 If you need to re-seed languages, clear the database first"
			);
		} else {
			// Insert all runtimes as programming languages
			const languageDocs = runtimes.map((runtime: PistonRuntime) => ({
				language: runtime.language,
				version: runtime.version,
				aliases: runtime.aliases || [],
				runtime: runtime.runtime
			}));

			const insertedLanguages =
				await ProgrammingLanguage.insertMany(languageDocs);
			console.log(
				`   ✓ Created ${insertedLanguages.length} programming languages`
			);
		}

		// Build language map from current database state
		const allLanguages = await ProgrammingLanguage.find({});
		console.log(
			`   ✓ Loaded ${allLanguages.length} programming languages for migration`
		);

		// Create a map for quick lookup: "language:version" -> ObjectId
		const languageMap = new Map<string, string>();
		allLanguages.forEach((lang) => {
			const key = `${lang.language}:${lang.version}`;
			languageMap.set(key, lang._id.toString());
		});

		// Step 3: Migrate Submissions
		console.log("\n📝 Migrating Submissions...");
		const submissions = (await Submission.find({
			language: { $exists: true },
			languageVersion: { $exists: true }
		}).lean()) as unknown as OldSubmission[];
		console.log(`   Found ${submissions.length} submissions to migrate`);

		let submissionsMigrated = 0;
		let submissionsCreated = 0;
		for (const submission of submissions) {
			if (!submission.language || !submission.languageVersion) {
				console.warn(
					`   ⚠️  Skipping submission ${submission._id} - missing language data`
				);
				continue;
			}

			const key = `${submission.language}:${submission.languageVersion}`;
			let languageId = languageMap.get(key);

			// If language doesn't exist, create it
			if (!languageId) {
				console.log(`   📝 Creating missing language: ${key}`);
				const newLanguage = await ProgrammingLanguage.create({
					language: submission.language,
					version: submission.languageVersion,
					aliases: []
				});
				languageId = newLanguage._id.toString();
				languageMap.set(key, languageId);
				submissionsCreated++;
			}

			await Submission.findByIdAndUpdate(submission._id, {
				$set: { programmingLanguage: languageId },
				$unset: { language: "", languageVersion: "" }
			});
			submissionsMigrated++;
		}
		console.log(
			`   ✓ Migrated ${submissionsMigrated} submissions (${submissionsCreated} languages created)`
		);

		// Step 4: Migrate Puzzle Solutions
		console.log("\n🧩 Migrating Puzzle Solutions...");

		// First, check total puzzles
		const totalPuzzles = await Puzzle.countDocuments({});
		console.log(`   Total puzzles in database: ${totalPuzzles}`);

		// Check puzzles with solution field
		const puzzlesWithSolution = await Puzzle.countDocuments({
			solution: { $exists: true, $ne: null }
		});
		console.log(`   Puzzles with solution field: ${puzzlesWithSolution}`);

		// Find puzzles with old language fields
		const puzzles = (await Puzzle.find({
			"solution.language": { $exists: true }
		})
			.select("+solution")
			.lean()) as unknown as OldPuzzle[];
		console.log(
			`   Found ${puzzles.length} puzzles with solution.language to migrate`
		);

		let solutionsMigrated = 0;
		let solutionsCreated = 0;
		let solutionsSkipped = 0;

		for (const puzzle of puzzles) {
			if (!puzzle.solution?.language || !puzzle.solution?.languageVersion) {
				console.log(
					`   ⚠️  Skipping puzzle ${puzzle._id} - missing language: ${puzzle.solution?.language}, version: ${puzzle.solution?.languageVersion}`
				);
				solutionsSkipped++;
				continue;
			}

			const key = `${puzzle.solution.language}:${puzzle.solution.languageVersion}`;
			let languageId = languageMap.get(key);

			// If language doesn't exist, create it
			if (!languageId) {
				console.log(`   📝 Creating missing language: ${key}`);
				const newLanguage = await ProgrammingLanguage.create({
					language: puzzle.solution.language,
					version: puzzle.solution.languageVersion,
					aliases: []
				});
				languageId = newLanguage._id.toString();
				languageMap.set(key, languageId);
				solutionsCreated++;
			}

			await Puzzle.findByIdAndUpdate(puzzle._id, {
				$set: { "solution.programmingLanguage": languageId },
				$unset: { "solution.language": "", "solution.languageVersion": "" }
			});
			solutionsMigrated++;
		}
		console.log(
			`   ✓ Migrated ${solutionsMigrated} puzzle solutions (${solutionsCreated} languages created, ${solutionsSkipped} skipped)`
		);

		// Step 5: Migrate Game allowedLanguages
		console.log("\n🎮 Migrating Game allowedLanguages...");
		const games = (await Game.find({
			"options.allowedLanguages": { $exists: true, $ne: [] }
		}).lean()) as unknown as OldGame[];
		console.log(`   Found ${games.length} games to migrate`);

		let gamesMigrated = 0;
		let gamesCreated = 0;
		let gamesSkipped = 0;

		for (const game of games) {
			if (
				!game.options?.allowedLanguages ||
				game.options.allowedLanguages.length === 0
			) {
				continue;
			}

			// Check if already migrated (first element is a string ObjectId)
			const firstLang = game.options.allowedLanguages[0];
			if (isString(firstLang)) {
				// Already migrated, skip
				console.log(`   ⏭️  Game ${game._id} already migrated, skipping`);
				gamesSkipped++;
				continue;
			}

			const allowedLanguageIds: string[] = [];
			for (const allowedLang of game.options.allowedLanguages) {
				if (isString(allowedLang)) {
					// Already an ObjectId, keep it
					allowedLanguageIds.push(allowedLang);
					continue;
				}

				// Skip if language or version is missing
				if (!allowedLang.language || !allowedLang.version) {
					console.warn(
						`   ⚠️  Skipping invalid language in game ${game._id}: language=${allowedLang.language}, version=${allowedLang.version}`
					);
					continue;
				}

				const key = `${allowedLang.language}:${allowedLang.version}`;
				let languageId = languageMap.get(key);

				// If language doesn't exist, create it
				if (!languageId) {
					console.log(`   📝 Creating missing language: ${key}`);
					const newLanguage = await ProgrammingLanguage.create({
						language: allowedLang.language,
						version: allowedLang.version,
						aliases: allowedLang.aliases || [],
						runtime: allowedLang.runtime
					});
					languageId = newLanguage._id.toString();
					languageMap.set(key, languageId);
					gamesCreated++;
				}

				allowedLanguageIds.push(languageId);
			}

			if (allowedLanguageIds.length > 0) {
				await Game.findByIdAndUpdate(game._id, {
					$set: { "options.allowedLanguages": allowedLanguageIds }
				});
				gamesMigrated++;
			}
		}
		console.log(
			`   ✓ Migrated ${gamesMigrated} games (${gamesCreated} languages created, ${gamesSkipped} skipped)`
		);

		console.log("\n" + "=".repeat(50));
		console.log("✨ Migration completed successfully!\n");
		console.log("Summary:");
		console.log(`   - Programming Languages: ${allLanguages.length}`);
		console.log(`   - Submissions migrated: ${submissionsMigrated}`);
		console.log(`   - Solutions migrated: ${solutionsMigrated}`);
		console.log(`   - Games migrated: ${gamesMigrated}`);
		console.log(
			"\n⚠️  IMPORTANT: Update your schemas and models before deploying!"
		);
	} catch (error) {
		console.error("\n❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await disconnectFromDatabase();
	}
}

migrate();
