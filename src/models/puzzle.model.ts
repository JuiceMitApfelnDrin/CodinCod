export type Puzzle = {
	_id: string;
	title: string;
	statement: string;
	constraints: string;
	author_id: string;
	// validators: list[Validator]
	// puzzle_types: list[PuzzleType]
	// difficulty: PuzzleDifficulty = PuzzleDifficulty.MEDIUM
};
