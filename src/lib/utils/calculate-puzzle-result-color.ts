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
		return "";
	}

	switch (something) {
		case PuzzleResultEnum.SUCCESS:
			return "bg-green-400 dark:bg-green-600";
		case PuzzleResultEnum.ERROR:
			return "bg-red-400 dark:bg-red-600";
		case PuzzleResultEnum.UNKNOWN:
			return "bg-violet-400 dark:bg-violet-600";
		default:
			return "bg-violet-400 dark:bg-violet-600";
	}
}
