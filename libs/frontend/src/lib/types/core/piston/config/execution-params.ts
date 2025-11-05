import type { PuzzleLanguage } from "../../puzzle/schema/puzzle-language.js";

export type CodeExecutionParams = {
	code: string;
	language: PuzzleLanguage;
	testInput: string;
	testOutput: string;
};
