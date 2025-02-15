import mongoose, { Document, Schema } from "mongoose";
import { PreferencesEntity } from "types";
import { PREFERENCES, USER } from "../../utils/constants/model.js";

interface PreferencesDocument extends Document, PreferencesEntity {}

const preferencesSchema = new Schema<PreferencesDocument>(
	{
		author: {
			ref: USER,
			required: true,
			type: mongoose.Schema.Types.ObjectId,
			index: true,
			unique: true,
			select: false
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
		programmingLanguage: {
			type: String
		},
		theme: {
			type: String
		}
	},
	{ timestamps: true }
);

const Preferences = mongoose.model<PreferencesDocument>(PREFERENCES, preferencesSchema);
export default Preferences;
