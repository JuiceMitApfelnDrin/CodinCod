export const PUZZLE_CONFIG = {
	// title
	minTitleLength: 4,
	maxTitleLength: 128,

	// statement
	minStatementLength: 1,
	maxStatementLength: 2048,

	// constraints
	minConstraintsLength: 1,
	maxConstraintsLength: 256,

	// required number of validators for a puzzle to be considered done
	requiredNumberOfValidators: 10
} as const;
