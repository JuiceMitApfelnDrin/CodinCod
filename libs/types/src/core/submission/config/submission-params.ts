import { LanguageLabel } from "../../puzzle/config/languages.js";

export type SubmissionParams = {
	code: string;
	language: LanguageLabel;
	puzzleId: string;
	userId: string;
};
