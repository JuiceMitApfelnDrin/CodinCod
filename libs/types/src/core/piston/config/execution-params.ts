import { LanguageLabel } from "../../puzzle/index.js";

export type CodeExecutionParams = {
	code: string;
	language: LanguageLabel;
	testInput: string;
	testOutput: string;
};
