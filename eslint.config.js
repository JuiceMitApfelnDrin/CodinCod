import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

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
		rules: {
			"no-undef": "off",
			"no-unused-vars": "off",
			"sort-keys": ["error", "asc", { caseSensitive: true, minKeys: 2, natural: false }],
			yoda: "error"
		},
		plugins: [, "sort-destructure-keys"]
	}
];
