import mongoose, { Document, Schema } from "mongoose";
import { ProgrammingLanguageEntity } from "types";
import { PROGRAMMING_LANGUAGE } from "../../utils/constants/model.js";

export interface ProgrammingLanguageDocument
	extends Document,
		Omit<ProgrammingLanguageEntity, "_id"> {
	_id: mongoose.Types.ObjectId;
}

const programmingLanguageSchema = new Schema<ProgrammingLanguageDocument>(
	{
		language: {
			required: true,
			type: String,
			trim: true,
			index: true
		},
		version: {
			required: true,
			type: String,
			trim: true,
			index: true
		},
		aliases: {
			type: [String],
			default: [],
			required: false
		},
		runtime: {
			type: String,
			required: false,
			trim: true
		}
	},
	{
		timestamps: true
	}
);

// Compound unique index to ensure language+version combination is unique
programmingLanguageSchema.index({ language: 1, version: 1 }, { unique: true });

const ProgrammingLanguage = mongoose.model<ProgrammingLanguageDocument>(
	PROGRAMMING_LANGUAGE,
	programmingLanguageSchema
);

export default ProgrammingLanguage;
