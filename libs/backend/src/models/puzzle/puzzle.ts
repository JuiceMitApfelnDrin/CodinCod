import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { PUZZLE, USER, METRICS } from "../../utils/constants/model.js";
import { DifficultyEnum, PuzzleEntity, PuzzleVisibilityEnum } from "types";
import solutionSchema from "./solution.js";
import validatorSchema from "./validator.js";

export interface PuzzleDocument
	extends Document,
		Omit<PuzzleEntity, "authorId" | "solution" | "_id"> {
	authorId: ObjectId;
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
	// TODO: rename authorId this to author, since it gets populated most of the time
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
		enum: Object.values(PuzzleVisibilityEnum),
		default: PuzzleVisibilityEnum.DRAFT,
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
		type: mongoose.Schema.Types.ObjectId,
		select: false
	},
	tags: [
		{
			type: String
		}
	]
});

const Puzzle = mongoose.model<PuzzleDocument>(PUZZLE, puzzleSchema);
export default Puzzle;
