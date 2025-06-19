import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import sortKeysFix from "eslint-plugin-sort-keys-fix";

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Recommended configurations for JavaScript and TypeScript
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	// Recommended configuration for Svelte
	...svelte.configs["flat/recommended"],
	// Prettier config to avoid formatting conflicts
	prettier,
	...svelte.configs["flat/prettier"],

	// Globals and other language options
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},

	// Svelte-specific parser settings
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser // Use TypeScript parser for Svelte files
			}
		},
		rules: {
			"svelte/valid-compile": [
				"warn",
				{
					ignoreWarnings: true
				}
			]
		}
	},

	// Ignore patterns for build and dist folders
	{
		ignores: ["build/", ".svelte-kit/", "dist/"]
	},

	// Custom rules and plugin configuration
	{
		plugins: {
			"sort-destructure-keys": sortDestructureKeys,
			"sort-keys-fix": sortKeysFix
		},
		rules: {
			"@typescript-eslint/no-unused-vars": "warn",
			"no-undef": "warn",
			"no-unused-vars": "warn",
			"sort-destructure-keys/sort-destructure-keys": [2, { caseSensitive: true }],
			"sort-keys": ["error", "asc", { caseSensitive: true, minKeys: 2, natural: false }],
			"sort-keys-fix/sort-keys-fix": "warn",
			yoda: "error"
		}
	}
];
