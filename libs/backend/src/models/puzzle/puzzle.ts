import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { PUZZLE, USER, METRICS, COMMENT } from "../../utils/constants/model.js";
import { DifficultyEnum, PuzzleEntity, puzzleVisibilityEnum } from "types";
import solutionSchema from "./solution.js";
import validatorSchema from "./validator.js";

export interface PuzzleDocument
	extends Document,
		Omit<PuzzleEntity, "author" | "solution" | "_id"> {
	author: ObjectId;
	solution?: ObjectId;
}

/**
 * IDEA: Eventually add puzzle types
 * offering different play modes and play styles
 */
const puzzleSchema = new Schema<PuzzleDocument>({
	title: {
		required: true,
		trim: true,
		type: String
	},
	statement: {
		trim: true,
		type: String
	},
	constraints: {
		trim: true,
		type: String
	},
	author: {
		ref: USER,
		required: true, // Ensure every puzzle has an author
		type: mongoose.Schema.Types.ObjectId
	},
	validators: [validatorSchema],
	difficulty: {
		enum: Object.values(DifficultyEnum),
		default: DifficultyEnum.INTERMEDIATE,
		required: true,
		type: String
	},
	visibility: {
		enum: Object.values(puzzleVisibilityEnum),
		default: puzzleVisibilityEnum.DRAFT,
		required: true,
		type: String
	},
	createdAt: {
		default: Date.now,
		type: Date
	},
	updatedAt: {
		default: Date.now,
		type: Date
	},
	solution: {
		type: solutionSchema,
		select: false
	},
	puzzleMetrics: {
		ref: METRICS,
		type: Schema.Types.ObjectId,
		select: false
	},
	tags: [
		{
			type: String
		}
	],
	comments: [
		{
			ref: COMMENT,
			type: Schema.Types.ObjectId
		}
	]
});

const Puzzle = mongoose.model<PuzzleDocument>(PUZZLE, puzzleSchema);
export default Puzzle;
