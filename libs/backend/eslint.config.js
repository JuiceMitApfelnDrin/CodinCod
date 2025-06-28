import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";

export default [
	{
		languageOptions: {
			globals: globals.node
		}
	},
	pluginJs.configs.recommended,
	eslintConfigPrettier,
	{
		ignores: [
			"**/node_modules",
			"**/dist",
			"**/build",
			"**/__snapshots__",
			"**/mocks",
			"**/coverage"
		]
	},
	{
		plugins: {
			"eslint-plugin-sort-destructure-keys": sortDestructureKeys
		},
		rules: {
			"no-undef": "warn",
			"no-unused-vars": "warn",
			"sort-keys": [
				"error",
				"asc",
				{ caseSensitive: true, minKeys: 2, natural: false }
			],
			yoda: "error"
		}
	}
];
