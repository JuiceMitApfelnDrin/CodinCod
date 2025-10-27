import { faker } from "@faker-js/faker";
import Game, { GameDocument } from "../../models/game/game.js";
import { GameModeEnum, GameVisibilityEnum } from "types";
import {
	randomFromArray,
	randomMultipleFromArray
} from "../utils/seed-helpers.js";
import { Types } from "mongoose";
import ProgrammingLanguage from "../../models/programming-language/language.js";

type GameModeValue = (typeof GameModeEnum)[keyof typeof GameModeEnum];
type GameVisibilityValue =
	(typeof GameVisibilityEnum)[keyof typeof GameVisibilityEnum];

export interface GameFactoryOptions {
	ownerId: Types.ObjectId;
	puzzleId: Types.ObjectId;
	playerIds: Types.ObjectId[];
	mode?: GameModeValue;
	visibility?: GameVisibilityValue;
}

/**
 * Generate game allowed languages from database
 */
async function generateAllowedLanguages(): Promise<string[]> {
	// Get all available programming languages from database
	const allLanguages = await ProgrammingLanguage.find().lean();

	if (allLanguages.length === 0) {
		throw new Error(
			"No programming languages found in database. Run migrations first!"
		);
	}

	// Select 1-4 languages randomly
	const count = faker.number.int({
		min: 1,
		max: Math.min(4, allLanguages.length)
	});
	const selectedLanguages = randomMultipleFromArray(allLanguages, count, count);

	return selectedLanguages.map((lang) => lang._id.toString());
}

/**
 * Create a single game with realistic data
 */
export async function createGame(
	options: GameFactoryOptions
): Promise<Types.ObjectId> {
	const mode = options.mode || randomFromArray(Object.values(GameModeEnum));
	const visibility =
		options.visibility || randomFromArray(Object.values(GameVisibilityEnum));

	// Game duration varies: 5min to 60min
	const durationInSeconds = faker.number.int({ min: 300, max: 3600 });

	// Start time can be in the past (completed) or future (scheduled)
	const isPast = faker.datatype.boolean({ probability: 0.7 }); // 70% past games
	const startTime = isPast
		? faker.date.recent({ days: 30 })
		: faker.date.soon({ days: 7 });

	const endTime = new Date(startTime.getTime() + durationInSeconds * 1000);

	// Select 2-4 players from provided player IDs
	const playerCount = Math.min(
		faker.number.int({ min: 2, max: 4 }),
		options.playerIds.length
	);
	const players = randomMultipleFromArray(
		options.playerIds,
		playerCount,
		playerCount
	);

	// Ensure owner is in the players list
	if (!players.includes(options.ownerId)) {
		players[0] = options.ownerId;
	}

	const gameData: Partial<GameDocument> = {
		owner: options.ownerId.toString(),
		puzzle: options.puzzleId.toString(),
		players: players.map((id) => id.toString()),
		startTime,
		endTime,
		options: {
			mode,
			visibility,
			maxGameDurationInSeconds: durationInSeconds,
			allowedLanguages: await generateAllowedLanguages()
		},
		playerSubmissions: []
	};

	const game = new Game(gameData);
	await game.save();

	return game._id as Types.ObjectId;
}

/**
 * Create multiple games with variety
 */
export async function createGames(
	count: number,
	userIds: Types.ObjectId[],
	puzzleIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const gameIds: Types.ObjectId[] = [];

	for (let i = 0; i < count; i++) {
		const ownerId = randomFromArray(userIds);
		const puzzleId = randomFromArray(puzzleIds);

		// Mode distribution: 60% RATED, 40% CASUAL
		const mode = faker.datatype.boolean({ probability: 0.6 })
			? GameModeEnum.RATED
			: GameModeEnum.CASUAL;

		// Visibility distribution: 70% PUBLIC, 30% PRIVATE
		const visibility = faker.datatype.boolean({ probability: 0.7 })
			? GameVisibilityEnum.PUBLIC
			: GameVisibilityEnum.PRIVATE;

		// Get random players (ensure we have enough users)
		const playerCount = Math.min(
			faker.number.int({ min: 2, max: 4 }),
			userIds.length
		);
		const playerIds = randomMultipleFromArray(
			userIds,
			playerCount,
			playerCount
		);

		gameIds.push(
			await createGame({
				ownerId,
				puzzleId,
				playerIds,
				mode,
				visibility
			})
		);
	}

	return gameIds;
}
