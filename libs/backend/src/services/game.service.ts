import Game, { GameDocument } from "../models/game/game.js";
import { GameEntity, ObjectId } from "types";

/**
 * Service for Game database operations
 * Centralizes all MongoDB queries for games
 */
export class GameService {
	/**
	 * Find a game by ID with all related data populated
	 */
	async findByIdPopulated(id: string | ObjectId): Promise<GameDocument | null> {
		return await Game.findById(id)
			.populate("owner")
			.populate("players")
			.populate({
				path: "playerSubmissions",
				populate: [{ path: "user" }, { path: "programmingLanguage" }]
			})
			.exec();
	}

	/**
	 * Find a game by ID without population
	 */
	async findById(id: string | ObjectId): Promise<GameDocument | null> {
		return await Game.findById(id).exec();
	}

	/**
	 * Create a new game
	 */
	async create(gameEntity: GameEntity): Promise<GameDocument> {
		const game = new Game(gameEntity);
		return await game.save();
	}

	/**
	 * Update a game's player submissions
	 */
	async addPlayerSubmission(
		gameId: string | ObjectId,
		submissionId: string | ObjectId
	): Promise<GameDocument | null> {
		const game = await Game.findById(gameId);
		if (!game) return null;

		const uniqueSubmissions = new Set([
			...(game.playerSubmissions ?? []),
			submissionId.toString()
		]);
		game.playerSubmissions = Array.from(uniqueSubmissions);

		return await game.save();
	}

	/**
	 * Add a player to a game with optimistic locking (prevents race conditions)
	 * @throws Error if version mismatch occurs (game was modified by another request)
	 */
	async addPlayer(
		gameId: string | ObjectId,
		playerId: string | ObjectId,
		expectedVersion: number
	): Promise<GameDocument | null> {
		const result = await Game.findOneAndUpdate(
			{
				_id: gameId,
				version: expectedVersion,
				players: { $ne: playerId }
			},
			{
				$push: { players: playerId },
				$inc: { version: 1 }
			},
			{ new: true }
		).exec();

		return result;
	}

	/**
	 * Find games by player ID
	 */
	async findByPlayerId(
		playerId: string | ObjectId,
		options?: {
			limit?: number;
			skip?: number;
			sort?: Record<string, 1 | -1>;
		}
	): Promise<GameDocument[]> {
		let query = Game.find({ players: playerId });

		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}

		return await query.exec();
	}

	/**
	 * Find games by owner ID
	 */
	async findByOwnerId(
		ownerId: string | ObjectId,
		options?: {
			limit?: number;
			skip?: number;
			sort?: Record<string, 1 | -1>;
		}
	): Promise<GameDocument[]> {
		let query = Game.find({ owner: ownerId });

		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}

		return await query.exec();
	}

	/**
	 * Find all games with optional filters
	 */
	async findAll(options?: {
		filter?: Record<string, any>;
		limit?: number;
		skip?: number;
		sort?: Record<string, 1 | -1>;
	}): Promise<GameDocument[]> {
		let query = Game.find(options?.filter ?? {});

		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}

		return await query.exec();
	}

	/**
	 * Count games matching a filter
	 */
	async count(filter?: Record<string, any>): Promise<number> {
		return await Game.countDocuments(filter ?? {});
	}

	/**
	 * Delete a game by ID
	 */
	async deleteById(id: string | ObjectId): Promise<GameDocument | null> {
		return await Game.findByIdAndDelete(id).exec();
	}
}

// Export a singleton instance
export const gameService = new GameService();
