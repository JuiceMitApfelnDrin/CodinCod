export type Validator = {
	// validator_type: ValidatorType;
	input: string;
	output: string;
};

export type Language = "javascript" | "typescript";
export type Type = 1 | 2 | 3;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Puzzle = {
	id: string;
	title: string;
	statement: string;
	constraints: string;
	author_id: string;
	validators: Validator[];
	types: Type[];
	difficulty: Difficulty;
	updated_at: Date;
	created_at: Date;
};
