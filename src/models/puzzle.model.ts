export type Validator = {
	// validator_type: ValidatorType;
	input: string;
	output: string;
};

export type Puzzle = {
	_id: string;
	title: string;
	statement: string;
	constraints: string;
	author_id: string;
	validators: Validator[];
	// puzzle_types: list[PuzzleType]
	// difficulty: PuzzleDifficulty = PuzzleDifficulty.MEDIUM
};
