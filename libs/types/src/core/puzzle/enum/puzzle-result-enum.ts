export const PuzzleResultEnum = {
	ERROR: "error",
	SUCCESS: "success",

	// TODO: probably want to get rid of unknown situations eventually :)
	UNKNOWN: "unknown"
} as const;

export type PuzzleResult = keyof typeof PuzzleResultEnum;
