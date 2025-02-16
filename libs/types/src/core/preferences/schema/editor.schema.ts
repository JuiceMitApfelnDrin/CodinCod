import { z } from "zod";
import { keymapSchema } from "../enum/keymap.js";

export const editorPreferencesSchema = z.object({
	keymap: keymapSchema
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;
