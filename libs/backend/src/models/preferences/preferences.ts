import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { PreferencesEntity } from "types";
import { PREFERENCES, USER } from "../../utils/constants/model.js";
import { preferencesEditor } from "./preferences-editor.js";

interface PreferencesDocument extends Document, Omit<PreferencesEntity, "owner" | "_id"> {
	owner: ObjectId;
}

const preferencesSchema = new Schema<PreferencesDocument>(
	{
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
		editor: {
			required: false,
			type: preferencesEditor
		},
		owner: {
			index: true,
			ref: USER,
			required: true,
			select: false,
			type: mongoose.Schema.Types.ObjectId,
			unique: true,
		},
		preferredLanguage: {
			required: false,
			type: String
		},
		theme: {
			required: false,
			type: String
		},
		
	},
	{ timestamps: true }
);

const Preferences = mongoose.model<PreferencesDocument>(PREFERENCES, preferencesSchema);
export default Preferences;
