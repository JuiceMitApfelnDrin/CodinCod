import { z } from "zod";
import { keymapSchema } from "../enum/keymap.js";
import { keymap } from "../config/editor.config.js";

export const editorPreferencesSchema = z.object({
	keymap: keymapSchema.prefault(keymap.VSCODE),
	lineNumbers: z.boolean().prefault(true),
	highlightActiveLineGutter: z.boolean().prefault(true),
	highlightSpecialChars: z.boolean().prefault(true),
	history: z.boolean().prefault(true),
	foldGutter: z.boolean().prefault(true),
	drawSelection: z.boolean().prefault(true),
	dropCursor: z.boolean().prefault(true),
	allowMultipleSelections: z.boolean().prefault(true),
	indentOnInput: z.boolean().prefault(true),
	bracketMatching: z.boolean().prefault(true),
	closeBrackets: z.boolean().prefault(true),
	autocompletion: z.boolean().prefault(true),
	rectangularSelection: z.boolean().prefault(true),
	crosshairCursor: z.boolean().prefault(true),
	highlightActiveLine: z.boolean().prefault(true),
	highlightSelectionMatches: z.boolean().prefault(true),
	defaultKeymap: z.boolean().prefault(true),
	searchKeymap: z.boolean().prefault(true),
	foldKeymap: z.boolean().prefault(true),
	completionKeymap: z.boolean().prefault(true),
	lintKeymap: z.boolean().prefault(true),
	syntaxHighlighting: z.boolean().prefault(true),
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;
