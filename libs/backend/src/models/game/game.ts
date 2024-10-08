import mongoose, { Schema, Document } from "mongoose";
import { GAME, PUZZLE, USER } from "../../utils/constants/model.js";
import { DEFAULT_GAME_LENGTH_IN_MILLISECONDS, GameEntity } from "types";
import gameConfigSchema from "./game-config.js";

interface GameDocument extends Document, Omit<GameEntity, "_id"> {}

/**
 * IDEA: Eventually add puzzle types
 * offering different play modes and play styles
 */
const gameSchema = new Schema<GameDocument>({
	players: [
		{
			ref: USER,
			required: true,
			type: Schema.Types.ObjectId
		}
	],
	createdAt: {
		default: Date.now,
		type: Date
	},
	creator: {
		ref: USER,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	startTime: {
		default: Date.now,
		type: Date,
		required: true
	},
	endTime: {
		default: () => Date.now() + DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
		type: Date,
		required: true
	},
	config: gameConfigSchema,
	puzzle: {
		ref: PUZZLE,
		required: true,
		type: Schema.Types.ObjectId
	}
});

const Game = mongoose.model<GameDocument>(GAME, gameSchema);
export default Game;
