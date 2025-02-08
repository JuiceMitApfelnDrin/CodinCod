import { PuzzleResultEnum, puzzleResultSchema } from "types";

/**
 * checks whether something is a puzzleResult
 *
 * @param {unknown} something
 * @returns a background color in accordance with the puzzleResult
 */
export function calculatePuzzleResultColor(something: unknown): string {
	const isPuzzleResult = puzzleResultSchema.safeParse(something);

	if (!isPuzzleResult.success) {
		return "border-gray-300 dark:border-gray-300";
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
