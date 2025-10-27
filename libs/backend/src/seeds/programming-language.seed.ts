import { arePistonRuntimes, PistonRuntime, pistonUrls } from "types";
import ProgrammingLanguage from "../models/programming-language/language.js";
import { buildPistonUri } from "@/utils/functions/build-piston-uri.js";

/**
 * Seed programming languages from Piston runtimes
 * This function fetches available runtimes from Piston and populates the ProgrammingLanguage collection
 */
export async function seedProgrammingLanguages() {
	try {
		console.log("Fetching available runtimes from Piston...");
		const response = await fetch(buildPistonUri(pistonUrls.RUNTIMES));
		const runtimes = await response.json();

		if (!arePistonRuntimes(runtimes)) {
			throw new Error("Failed to fetch Piston runtimes");
		}

		console.log(`Found ${runtimes.length} runtimes from Piston`);

		// Clear existing programming languages
		await ProgrammingLanguage.deleteMany({});
		console.log("Cleared existing programming languages");

		// Insert all runtimes as programming languages
		const languageDocs = runtimes.map((runtime: PistonRuntime) => ({
			language: runtime.language,
			version: runtime.version,
			aliases: runtime.aliases || [],
			runtime: runtime.runtime
		}));

		const insertedLanguages =
			await ProgrammingLanguage.insertMany(languageDocs);
		console.log(`✓ Seeded ${insertedLanguages.length} programming languages`);

		return insertedLanguages;
	} catch (error) {
		console.error("Error seeding programming languages:", error);
		throw error;
	}
}
