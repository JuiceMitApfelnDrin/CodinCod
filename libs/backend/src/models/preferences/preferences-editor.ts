import { Schema } from "mongoose";
import { EditorPreferences } from "types";

export const preferencesEditor = new Schema<EditorPreferences>({
	allowMultipleSelections: {
		required: false,
		type: Boolean
	},
	autocompletion: {
		required: false,
		type: Boolean
	},
	bracketMatching: {
		required: false,
		type: Boolean
	},
	closeBrackets: {
		required: false,
		type: Boolean
	},
	completionKeymap: {
		required: false,
		type: Boolean
	},
	crosshairCursor: {
		required: false,
		type: Boolean
	},
	defaultKeymap: {
		required: false,
		type: Boolean
	},
	drawSelection: {
		required: false,
		type: Boolean
	},
	dropCursor: {
		required: false,
		type: Boolean
	},
	foldGutter: {
		required: false,
		type: Boolean
	},
	foldKeymap: {
		required: false,
		type: Boolean
	},
	highlightActiveLine: {
		required: false,
		type: Boolean
	},
	highlightActiveLineGutter: {
		required: false,
		type: Boolean
	},
	highlightSelectionMatches: {
		required: false,
		type: Boolean
	},
	highlightSpecialChars: {
		required: false,
		type: Boolean
	},
	history: {
		required: false,
		type: Boolean
	},
	indentOnInput: {
		required: false,
		type: Boolean
	},
	keymap: {
		required: false,
		type: String
	},
	lineNumbers: {
		required: false,
		type: Boolean
	},
	lintKeymap: {
		required: false,
		type: Boolean
	},
	rectangularSelection: {
		required: false,
		type: Boolean
	},
	searchKeymap: {
		required: false,
		type: Boolean
	}
});
