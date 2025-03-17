import { Schema } from "mongoose";
import { EditorPreferences } from "types";

export const preferencesEditor = new Schema<EditorPreferences>({
	keymap: {
		type: String,
		required: false
	},
	allowMultipleSelections: {
		type: Boolean,
		required: false
	},
	autocompletion: {
		type: Boolean,
		required: false
	},
	bracketMatching: {
		type: Boolean,
		required: false
	},
	closeBrackets: {
		type: Boolean,
		required: false
	},
	completionKeymap: {
		type: Boolean,
		required: false
	},
	crosshairCursor: {
		type: Boolean,
		required: false
	},
	defaultKeymap: {
		type: Boolean,
		required: false
	},
	drawSelection: {
		type: Boolean,
		required: false
	},
	dropCursor: {
		type: Boolean,
		required: false
	},
	foldGutter: {
		type: Boolean,
		required: false
	},
	foldKeymap: {
		type: Boolean,
		required: false
	},
	highlightActiveLine: {
		type: Boolean,
		required: false
	},
	highlightActiveLineGutter: {
		type: Boolean,
		required: false
	},
	highlightSelectionMatches: {
		type: Boolean,
		required: false
	},
	highlightSpecialChars: {
		type: Boolean,
		required: false
	},
	history: {
		type: Boolean,
		required: false
	},
	indentOnInput: {
		type: Boolean,
		required: false
	},
	lineNumbers: {
		type: Boolean,
		required: false
	},
	lintKeymap: {
		type: Boolean,
		required: false
	},
	rectangularSelection: {
		type: Boolean,
		required: false
	},
	searchKeymap: {
		type: Boolean,
		required: false
	}
});
