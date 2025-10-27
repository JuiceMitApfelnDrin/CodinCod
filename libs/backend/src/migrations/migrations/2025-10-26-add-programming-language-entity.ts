import { Migration } from "../framework/migration.interface.js";
import ProgrammingLanguage from "../../models/programming-language/language.js";
import Submission from "../../models/submission/submission.js";
import Puzzle from "../../models/puzzle/puzzle.js";
import Game from "../../models/game/game.js";
import {
	arePistonRuntimes,
	httpRequestMethod,
	isObjectId,
	PistonRuntime,
	pistonUrls
} from "types";
import { buildPistonUri } from "../../utils/functions/build-piston-uri.js";

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
 * Migration: Add ProgrammingLanguage entity and migrate existing data
 *
 * This migration:
 * 1. Fetches programming languages from Piston
 * 2. Creates ProgrammingLanguage documents
 * 3. Migrates existing Submissions to reference ProgrammingLanguage ObjectIds
 * 4. Migrates existing Puzzle Solutions to reference ProgrammingLanguage ObjectIds
 * 5. Migrates existing Game allowedLanguages to reference ProgrammingLanguage ObjectIds
 */
export class AddProgrammingLanguageEntityMigration implements Migration {
	name = "2025-10-26-add-programming-language-entity";
	description =
		"Create ProgrammingLanguage collection and migrate all language references from embedded strings to ObjectId references";

	async up(): Promise<void> {
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

		console.log(`   ✓ Found ${runtimes.length} runtimes from Piston`);

		// Step 2: Create ProgrammingLanguage documents
		console.log("\n🗄️  Creating ProgrammingLanguage documents...");

		// Check if languages already exist
		const existingCount = await ProgrammingLanguage.countDocuments();
		if (existingCount > 0) {
			console.log(
				`   ℹ️  Found ${existingCount} existing languages, skipping creation`
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

		// Get all languages for mapping
		const allLanguages = await ProgrammingLanguage.find().lean();

		// Create a map for quick lookup: "language:version" -> ObjectId
		const languageMap = new Map<string, string>();
		allLanguages.forEach((lang) => {
			const key = `${lang.language}:${lang.version}`;
			languageMap.set(key, lang._id.toString());
		});

		// Step 3: Migrate Submissions
		await this.migrateSubmissions(languageMap);

		// Step 4: Migrate Puzzle Solutions
		await this.migratePuzzleSolutions(languageMap);

		// Step 5: Migrate Game allowedLanguages
		await this.migrateGameLanguages(languageMap);
	}

	private async migrateSubmissions(
		languageMap: Map<string, string>
	): Promise<void> {
		console.log("\n📝 Migrating Submissions...");

		// Find submissions that still have the old fields
		const submissions = (await Submission.find({
			language: { $exists: true },
			languageVersion: { $exists: true }
		}).lean()) as unknown as OldSubmission[];

		console.log(`   Found ${submissions.length} submissions to migrate`);

		let migrated = 0;
		let skipped = 0;
		let created = 0;

		for (const submission of submissions) {
			if (!submission.language || !submission.languageVersion) {
				skipped++;
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
				created++;
			}

			await Submission.findByIdAndUpdate(submission._id, {
				$set: { programmingLanguage: languageId },
				$unset: { language: "", languageVersion: "" }
			});
			migrated++;
		}

		console.log(
			`   ✓ Migrated ${migrated} submissions (${skipped} skipped, ${created} languages created)`
		);
	}

	private async migratePuzzleSolutions(
		languageMap: Map<string, string>
	): Promise<void> {
		console.log("\n🧩 Migrating Puzzle Solutions...");

		// Find puzzles with solutions that have old fields
		const puzzles = (await Puzzle.find({
			"solution.language": { $exists: true }
		}).lean()) as unknown as OldPuzzle[];

		console.log(`   Found ${puzzles.length} puzzles with solutions to migrate`);

		let migrated = 0;
		let skipped = 0;
		let created = 0;

		for (const puzzle of puzzles) {
			if (!puzzle.solution?.language || !puzzle.solution?.languageVersion) {
				skipped++;
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
				created++;
			}

			await Puzzle.findByIdAndUpdate(puzzle._id, {
				$set: { "solution.programmingLanguage": languageId },
				$unset: { "solution.language": "", "solution.languageVersion": "" }
			});
			migrated++;
		}

		console.log(
			`   ✓ Migrated ${migrated} puzzle solutions (${skipped} skipped, ${created} languages created)`
		);
	}

	private async migrateGameLanguages(
		languageMap: Map<string, string>
	): Promise<void> {
		console.log("\n🎮 Migrating Game allowedLanguages...");

		// Find games that might have old-style allowedLanguages
		const games = (await Game.find({
			"options.allowedLanguages": { $exists: true, $ne: [] }
		}).lean()) as unknown as OldGame[];

		console.log(`   Found ${games.length} games to check`);

		let migrated = 0;
		let skipped = 0;
		let created = 0;

		for (const game of games) {
			if (
				!game.options?.allowedLanguages ||
				game.options.allowedLanguages.length === 0
			) {
				skipped++;
				continue;
			}

			// Check if first element is a string (ObjectId) or object
			const firstLang = game.options.allowedLanguages[0];
			if (typeof firstLang === "string") {
				// Already migrated
				skipped++;
				continue;
			}

			const allowedLanguageIds: string[] = [];
			for (const allowedLang of game.options.allowedLanguages) {
				if (isObjectId(allowedLang)) {
					allowedLanguageIds.push(allowedLang);
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
					created++;
				}

				allowedLanguageIds.push(languageId);
			}

			if (allowedLanguageIds.length > 0) {
				await Game.findByIdAndUpdate(game._id, {
					$set: { "options.allowedLanguages": allowedLanguageIds }
				});
				migrated++;
			} else {
				skipped++;
			}
		}

		console.log(
			`   ✓ Migrated ${migrated} games (${skipped} skipped, ${created} languages created)`
		);
	}

	async down(): Promise<void> {
		throw new Error(
			"Rollback not supported for programming language migration. " +
				"Original data is removed during migration. " +
				"Please restore from backup if rollback is needed."
		);
	}
}
