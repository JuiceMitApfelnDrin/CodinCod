import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs["flat/recommended"],
	prettier,
	...svelte.configs["flat/prettier"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ["build/", ".svelte-kit/", "dist/"]
	},
	{
		rules: {
			"no-undef": "off",
			"no-unused-vars": "off",
			"sort-keys": ["error", "asc", { caseSensitive: true, minKeys: 2, natural: false }],
			yoda: "error",
			"sort-destructure-keys/sort-destructure-keys": [2, { caseSensitive: true }]
		},
		plugins: {
			sortDestructureKeys
		}
	}
];
