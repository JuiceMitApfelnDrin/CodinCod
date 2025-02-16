import { Schema } from "mongoose";
import { EditorPreferences } from "types";

export const preferencesEditor = new Schema<EditorPreferences>({
	keymap: {
		type: String,
		required: false
	}
});
