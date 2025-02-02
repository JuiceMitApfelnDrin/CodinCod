import { z } from "zod";
import { getKeys } from "../../../utils/functions/getKeys.js";

export const supportedLanguages = {
	python: {
		language: "python",
		version: "3.12.0"
	},
	javascript: {
		language: "deno-js",
		version: "1.32.3"
	},
	typescript: {
		language: "typescript",
		version: "5.0.3"
	},
	"basic.net": {
		language: "basic.net",
		version: "5.0.201"
	},
	"fsharp.net": {
		language: "fsharp.net",
		version: "5.0.201"
	},
	"csharp.net": {
		language: "csharp.net",
		version: "5.0.201"
	},
	ruby: {
		language: "ruby",
		version: "3.0.1"
	}
} as const;

export type LanguageLabel = keyof typeof supportedLanguages;

// TODO: check when everything is done and dusted, if these 2 are used anywhere, otherwise remove them
export type Language = (typeof supportedLanguages)[LanguageLabel]["language"];
export type LanguageVersion = string;

export const languageLabels = Object.keys(supportedLanguages) as LanguageLabel[];
export const DEFAULT_LANGUAGE: LanguageLabel = "python";

export const LanguageLabelEnum = z.enum(getKeys(supportedLanguages));
