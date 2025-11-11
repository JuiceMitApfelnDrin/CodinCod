import { puzzleResultSchema } from "$lib/types/core/piston/schema/puzzle-result.js";
import { PuzzleResultEnum } from "$lib/types/core/puzzle/enum/puzzle-result-enum.js";

/**
 * checks whether something is a puzzleResult
 *
 * @param {unknown} something
 * @returns a background color in accordance with the puzzleResult
 */
export function calculatePuzzleResultColor(something: unknown): string {
	const isPuzzleResult = puzzleResultSchema.safeParse(something);

	if (!isPuzzleResult.success) {
		return "border-neutral-300 dark:border-neutral-300";
	}

	switch (something) {
		case PuzzleResultEnum.SUCCESS:
			return "border-green-600 dark:border-green-600";
		case PuzzleResultEnum.UNKNOWN:
		case PuzzleResultEnum.ERROR:
			return "border-red-600 dark:border-red-600";
		default:
			return "border-violet-600 dark:border-violet-600";
	}
}

export function calculatePuzzleResultIconColor(something: unknown): string {
	const isPuzzleResult = puzzleResultSchema.safeParse(something);

	if (!isPuzzleResult.success) {
		return "dark:text-black text-white dark:bg-neutral-400 bg-neutral-600";
	}

	switch (something) {
		case PuzzleResultEnum.SUCCESS:
			return "dark:text-black text-white dark:bg-green-400 bg-green-600";
		case PuzzleResultEnum.UNKNOWN:
		case PuzzleResultEnum.ERROR:
			return "dark:text-black text-white dark:bg-red-400 bg-red-600";
		default:
			return "dark:text-black text-white dark:bg-violet-400 bg-violet-600";
	}
}
