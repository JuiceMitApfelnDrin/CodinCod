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
	author: {
		ref: USER,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	comments: [
		{
			ref: COMMENT,
			type: Schema.Types.ObjectId
		}
	],
	constraints: {
		trim: true,
		type: String
	},
	createdAt: {
		default: Date.now,
		type: Date
	},
	difficulty: {
		default: DifficultyEnum.INTERMEDIATE,
		enum: Object.values(DifficultyEnum),
		required: true,
		type: String
	},
	puzzleMetrics: {
		ref: METRICS,
		select: false,
		type: Schema.Types.ObjectId
	},
	solution: {
		select: false,
		type: solutionSchema
	},
	statement: {
		trim: true,
		type: String
	},
	tags: [
		{
			type: String
		}
	],
	title: {
		required: true,
		trim: true,
		type: String
	},
	updatedAt: {
		default: Date.now,
		type: Date
	},
	validators: [validatorSchema],
	visibility: {
		default: puzzleVisibilityEnum.DRAFT,
		enum: Object.values(puzzleVisibilityEnum),
		required: true,
		type: String
	}
});

const Puzzle = mongoose.model<PuzzleDocument>(PUZZLE, puzzleSchema);
export default Puzzle;
