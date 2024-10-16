import mongoose, { Schema, Document } from "mongoose";
import { GAME, PUZZLE, USER } from "../../utils/constants/model.js";
import { DEFAULT_GAME_LENGTH_IN_MILLISECONDS, GameEntity } from "types";
import gameOptionsSchema from "./game-config.js";

interface GameDocument extends Document, Omit<GameEntity, "_id"> {}

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
	options: gameOptionsSchema,
	puzzle: {
		ref: PUZZLE,
		required: true,
		type: Schema.Types.ObjectId
	}
});

const Game = mongoose.model<GameDocument>(GAME, gameSchema);
export default Game;
