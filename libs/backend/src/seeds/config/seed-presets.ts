export interface SeedPreset {
	name: string;
	counts: {
		users: number;
		puzzles: number;
		submissionsPerPuzzle: number;
		commentsPerPuzzle: number;
		reports: number;
		games: number;
	};
}

export const SEED_PRESETS: Record<string, SeedPreset> = {
	minimal: {
		name: "Minimal",
		counts: {
			users: 5,
			puzzles: 5,
			submissionsPerPuzzle: 2,
			commentsPerPuzzle: 2,
			reports: 2,
			games: 2
		}
	},
	
	standard: {
		name: "Standard",
		counts: {
			users: 20,
			puzzles: 30,
			submissionsPerPuzzle: 5,
			commentsPerPuzzle: 8,
			reports: 12,
			games: 15
		}
	},
	
	comprehensive: {
		name: "Comprehensive",
		counts: {
			users: 100,
			puzzles: 150,
			submissionsPerPuzzle: 15,
			commentsPerPuzzle: 20,
			reports: 50,
			games: 75
		}
	},
	
	demo: {
		name: "Demo",
		counts: {
			users: 25,
			puzzles: 40,
			submissionsPerPuzzle: 8,
			commentsPerPuzzle: 12,
			reports: 15,
			games: 20
		}
	}
};


export function getSeedPreset(presetName?: string): SeedPreset {
	const name = presetName?.toLowerCase() || "standard";
	return SEED_PRESETS[name] || SEED_PRESETS.standard;
}

export function getSeedCounts(getEnvNumber: (key: string, defaultValue: number) => number) {
	const presetName = process.env.SEED_PRESET;
	const preset = getSeedPreset(presetName);

	return {
		users: getEnvNumber("SEED_USERS", preset.counts.users),
		puzzles: getEnvNumber("SEED_PUZZLES", preset.counts.puzzles),
		submissionsPerPuzzle: getEnvNumber("SEED_SUBMISSIONS_PER_PUZZLE", preset.counts.submissionsPerPuzzle),
		commentsPerPuzzle: getEnvNumber("SEED_COMMENTS_PER_PUZZLE", preset.counts.commentsPerPuzzle),
		reports: getEnvNumber("SEED_REPORTS", preset.counts.reports),
		games: getEnvNumber("SEED_GAMES", preset.counts.games)
	};
}
