import mongoose, { Schema, Document } from "mongoose";
import { GAME, PUZZLE, SUBMISSION, USER } from "../../utils/constants/model.js";
import { DEFAULT_GAME_LENGTH_IN_MILLISECONDS, GameEntity } from "types";
import gameOptionsSchema from "./game-config.js";

export interface GameDocument extends Document, GameEntity {}

const gameSchema = new Schema<GameDocument>({
	createdAt: {
		default: Date.now,
		type: Date
	},
	endTime: {
		default: () => Date.now() + DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
		required: true,
		type: Date
	},
	options: gameOptionsSchema,
	owner: {
		ref: USER,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	playerSubmissions: [
		{
			ref: SUBMISSION,
			required: false,
			type: Schema.Types.ObjectId
		}
	],
	players: [
		{
			ref: USER,
			required: true,
			type: Schema.Types.ObjectId
		}
	],
	
	puzzle: {
		ref: PUZZLE,
		required: true,
		type: Schema.Types.ObjectId
	},
	startTime: {
		default: Date.now,
		required: true,
		type: Date
	},
});

const Game = mongoose.model<GameDocument>(GAME, gameSchema);
export default Game;
