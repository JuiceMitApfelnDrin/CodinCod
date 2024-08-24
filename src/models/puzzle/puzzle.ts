import mongoose, { Schema, Document } from "mongoose";
import { PUZZLE, USER, METRICS } from "../../utils/constants/model.js";
import { DifficultyEnum, PuzzleEntity, VisibilityEnum } from "types";
import solutionSchema from "./solution.js";
import validatorSchema from "./validator.js";

interface PuzzleDocument
	extends Document,
		Omit<PuzzleEntity, "authorId" | "validators" | "solution" | "_id"> {
	authorId: mongoose.Types.ObjectId;
	validators: mongoose.Types.ObjectId[];
	solution?: mongoose.Types.ObjectId;
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
	authorId: {
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
		enum: Object.values(VisibilityEnum),
		default: VisibilityEnum.DRAFT,
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
		type: solutionSchema
	},
	puzzleMetrics: {
		ref: METRICS,
		type: mongoose.Schema.Types.ObjectId
	},
	tags: [
		{
			type: String
		}
	]
});

const Puzzle = mongoose.model<PuzzleDocument>(PUZZLE, puzzleSchema);
export default Puzzle;
