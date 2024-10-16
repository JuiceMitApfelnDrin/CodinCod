import { isString, type PuzzleDto } from "types";

export function getAuthorIdFromPuzzleDto(puzzle: PuzzleDto) {
	const puzzleAuthorId = isString(puzzle.authorId) ? puzzle.authorId : puzzle.authorId._id;

	return puzzleAuthorId;
}
