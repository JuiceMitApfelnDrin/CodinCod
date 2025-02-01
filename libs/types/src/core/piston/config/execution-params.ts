import { LanguageLabel } from "../../puzzle/config/languages.js";

export type CodeExecutionParams = {
	code: string;
	language: LanguageLabel;
	testInput: string;
	testOutput: string;
};
