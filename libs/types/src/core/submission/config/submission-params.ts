import { LanguageLabel } from "../../puzzle/index.js";

export type SubmissionParams = {
	code: string;
	language: LanguageLabel;
	puzzleId: string;
};
