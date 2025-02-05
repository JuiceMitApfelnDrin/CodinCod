import { PuzzleLanguage } from "../../puzzle/schema/puzzle-language.js";

export type SubmissionParams = {
	code: string;
	language: PuzzleLanguage;
	puzzleId: string;
	userId: string;
};
