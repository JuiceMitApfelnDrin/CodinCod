import { z } from "zod";
import { keymapSchema } from "../enum/keymap.js";
import { keymap } from "../config/editor-config.js";

export const editorPreferencesSchema = z.object({
	keymap: keymapSchema.default(keymap.VSCODE),
	lineNumbers: z.boolean().default(true),
	highlightActiveLineGutter: z.boolean().default(true),
	highlightSpecialChars: z.boolean().default(true),
	history: z.boolean().default(true),
	foldGutter: z.boolean().default(true),
	drawSelection: z.boolean().default(true),
	dropCursor: z.boolean().default(true),
	allowMultipleSelections: z.boolean().default(true),
	indentOnInput: z.boolean().default(true),
	bracketMatching: z.boolean().default(true),
	closeBrackets: z.boolean().default(true),
	autocompletion: z.boolean().default(true),
	rectangularSelection: z.boolean().default(true),
	crosshairCursor: z.boolean().default(true),
	highlightActiveLine: z.boolean().default(true),
	highlightSelectionMatches: z.boolean().default(true),
	defaultKeymap: z.boolean().default(true),
	searchKeymap: z.boolean().default(true),
	foldKeymap: z.boolean().default(true),
	completionKeymap: z.boolean().default(true),
	lintKeymap: z.boolean().default(true),
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;
