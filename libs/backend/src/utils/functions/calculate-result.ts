import { PuzzleResult, PuzzleResultEnum } from "types";

export function calculateResult(output?: string, expectedOutput?: string): PuzzleResult {
	if (!output || !expectedOutput) {
		return PuzzleResultEnum.UNKNOWN;
	}

	const trimmedOutput = output.trim();
	const trimmedExpectedOutput = expectedOutput.trim();

	if (trimmedExpectedOutput === trimmedOutput) {
		return PuzzleResultEnum.SUCCESS;
	}

	return PuzzleResultEnum.ERROR;
}
