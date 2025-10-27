import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { PreferencesEntity } from "types";
import { PREFERENCES, USER } from "../../utils/constants/model.js";
import { preferencesEditor } from "./preferences-editor.js";

export interface PreferencesDocument
	extends Document,
		Omit<PreferencesEntity, "owner" | "_id"> {
	owner: ObjectId;
}

const preferencesSchema = new Schema<PreferencesDocument>(
	{
		owner: {
			ref: USER,
			required: true,
			type: mongoose.Schema.Types.ObjectId,
			index: true,
			unique: true
		},
		blockedUsers: {
			required: false,
			type: [
				{
					ref: USER,
					required: false,
					type: mongoose.Schema.Types.ObjectId
				}
			]
		},
		preferredLanguage: {
			type: String,
			required: false
		},
		theme: {
			type: String,
			required: false
		},
		editor: {
			type: preferencesEditor,
			required: false
		}
	},
	{ timestamps: true }
);

const Preferences = mongoose.model<PreferencesDocument>(
	PREFERENCES,
	preferencesSchema
);
export default Preferences;
