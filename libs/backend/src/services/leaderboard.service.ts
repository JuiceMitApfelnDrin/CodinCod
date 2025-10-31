import { GameMode, gameModeEnum } from "types";
import UserMetrics, {
	UserMetricsDocument
} from "../models/user-metrics/user-metrics.js";
import Game, { GameDocument } from "../models/game/game.js";
import Submission from "../models/submission/submission.js";
import User from "../models/user/user.js";
import { gameModeService } from "./game-mode.service.js";
import {
	calculateNewRating,
	getDefaultRating,
	type GlickoRating
} from "../utils/rating/glicko.js";

/**
 * Service for calculating and managing leaderboards
 * Processes games incrementally to update player ratings and rankings
 */
export class LeaderboardService {
	/**
	 * Get or create user metrics document
	 */
	async getUserMetrics(userId: string): Promise<UserMetricsDocument> {
		let metrics = await UserMetrics.findOne({ userId });

		if (!metrics) {
			metrics = new UserMetrics({
				userId,
				totalGamesPlayed: 0,
				totalGamesWon: 0,
				lastProcessedGameDate: new Date(0),
				lastCalculationDate: new Date()
			});
			await metrics.save();
		}

		return metrics;
	}

	/**
	 * Process all completed games since last update for a specific game mode
	 */
	async processGamesForMode(mode: GameMode): Promise<number> {
		// Get all user metrics to find the earliest lastProcessedGameDate
		const allMetrics = await UserMetrics.find({});
		const earliestProcessedDate = allMetrics.reduce((earliest, metric) => {
			const modeMetrics = metric[mode as keyof UserMetricsDocument];
			if (!modeMetrics || typeof modeMetrics !== "object") return earliest;

			const lastGameDate = (modeMetrics as any).lastGameDate;
			if (!lastGameDate) return earliest;

			return lastGameDate < earliest ? lastGameDate : earliest;
		}, new Date(0));

		// Find completed games since last processed date
		const completedGames = await Game.find({
			"options.mode": mode,
			status: "completed",
			createdAt: { $gt: earliestProcessedDate }
		})
			.populate("players")
			.sort({ createdAt: 1 })
			.exec();

		let processedCount = 0;

		for (const game of completedGames) {
			await this.processGameResults(game, mode);
			processedCount++;
		}

		// Update rankings after processing all games
		if (processedCount > 0) {
			await this.updateRankingsForMode(mode);
		}

		return processedCount;
	}

	/**
	 * Process results from a single game and update player ratings
	 */
	async processGameResults(game: GameDocument, mode: GameMode): Promise<void> {
		if (!game.playerSubmissions || game.playerSubmissions.length === 0) {
			return;
		}

		// Get all submissions with user data
		const submissions = await Submission.find({
			_id: { $in: game.playerSubmissions }
		})
			.populate("user")
			.select("+code")
			.exec();

		if (submissions.length < 2) {
			// Not enough players to calculate ratings
			return;
		}

		// Get leaderboard to determine winner and rankings
		const leaderboard = gameModeService.getGameLeaderboard(
			game,
			submissions as any
		);

		if (leaderboard.length === 0) return;

		const winner = leaderboard[0];

		// Update metrics for each player
		for (let i = 0; i < leaderboard.length; i++) {
			const entry = leaderboard[i];
			const userId = entry.userId;

			if (!userId) continue;

			const metrics = await this.getUserMetrics(userId);

			// Initialize game mode metrics if not exists
			if (!metrics[mode]) {
				(metrics as any)[mode] = {
					gamesPlayed: 0,
					gamesWon: 0,
					bestScore: 0,
					averageScore: 0,
					totalScore: 0,
					glickoRating: getDefaultRating()
				};
			}

			const modeMetrics = (metrics as any)[mode];
			const isWinner = entry.userId === winner.userId;

			// Update game count and scores
			modeMetrics.gamesPlayed += 1;
			if (isWinner) {
				modeMetrics.gamesWon += 1;
			}

			modeMetrics.totalScore += entry.score;
			modeMetrics.averageScore =
				modeMetrics.totalScore / modeMetrics.gamesPlayed;

			if (entry.score > modeMetrics.bestScore) {
				modeMetrics.bestScore = entry.score;
			}

			// Update Glicko rating based on outcomes against all opponents
			const currentRating: GlickoRating = modeMetrics.glickoRating;
			const games = leaderboard
				.filter((opp) => opp.userId !== userId)
				.map((opponent) => {
					const opponentMetrics = (metrics as any)[mode];
					const opponentRating: GlickoRating =
						opponentMetrics?.glickoRating || getDefaultRating();

					// Determine if player beat this opponent
					const playerWon = entry.rank < opponent.rank;

					return { opponentRating, playerWon };
				});

			if (games.length > 0) {
				const newRating = calculateNewRating(
					currentRating,
					games.map((g) => ({
						opponentRating: g.opponentRating.rating,
						opponentRd: g.opponentRating.rd,
						score: g.playerWon ? 1 : 0
					}))
				);

				modeMetrics.glickoRating = newRating;
			}

			modeMetrics.lastGameDate = game.createdAt;

			// Update overall stats
			metrics.totalGamesPlayed += 1;
			if (isWinner) {
				metrics.totalGamesWon += 1;
			}

			metrics.lastProcessedGameDate = game.createdAt;
			metrics.lastCalculationDate = new Date();

			await metrics.save();
		}
	}

	/**
	 * Update rankings for all players in a game mode
	 */
	async updateRankingsForMode(mode: GameMode): Promise<void> {
		const modeField = `${mode}.glickoRating.rating`;

		// Get all users sorted by rating for this mode
		const sortedMetrics = await UserMetrics.find({
			[mode]: { $exists: true }
		})
			.sort({ [modeField]: -1 })
			.exec();

		// Update ranks
		for (let i = 0; i < sortedMetrics.length; i++) {
			const metrics = sortedMetrics[i];
			const modeMetrics = (metrics as any)[mode];

			if (modeMetrics) {
				modeMetrics.rank = i + 1;
				await metrics.save();
			}
		}
	}

	/**
	 * Recalculate all leaderboards (called by cron job)
	 */
	async recalculateAllLeaderboards(): Promise<{
		processedGames: Record<GameMode, number>;
		totalProcessed: number;
	}> {
		const modes = Object.values(gameModeEnum);
		const results: Record<GameMode, number> = {} as Record<GameMode, number>;
		let totalProcessed = 0;

		for (const mode of modes) {
			const count = await this.processGamesForMode(mode);
			results[mode] = count;
			totalProcessed += count;
		}

		return { processedGames: results, totalProcessed };
	}

	/**
	 * Get leaderboard entries for a specific game mode
	 */
	async getLeaderboard(
		mode: GameMode,
		page: number = 1,
		pageSize: number = 50
	): Promise<{
		entries: Array<{
			rank: number;
			userId: string;
			username: string;
			rating: number;
			glicko: GlickoRating;
			gamesPlayed: number;
			gamesWon: number;
			winRate: number;
			bestScore: number;
			averageScore: number;
		}>;
		total: number;
		lastUpdated: Date;
	}> {
		const skip = (page - 1) * pageSize;
		const modeField = `${mode}.glickoRating.rating`;

		const metrics = await UserMetrics.find({
			[mode]: { $exists: true }
		})
			.sort({ [modeField]: -1 })
			.skip(skip)
			.limit(pageSize)
			.populate("userId", "username")
			.exec();

		const total = await UserMetrics.countDocuments({
			[mode]: { $exists: true }
		});

		const entries = await Promise.all(
			metrics.map(async (metric) => {
				const modeMetrics = (metric as any)[mode];
				const user = await User.findById(metric.userId);

				return {
					rank: modeMetrics.rank || 0,
					userId: metric.userId.toString(),
					username: user?.username || "Unknown",
					rating: modeMetrics.glickoRating.rating,
					glicko: modeMetrics.glickoRating,
					gamesPlayed: modeMetrics.gamesPlayed,
					gamesWon: modeMetrics.gamesWon,
					winRate:
						modeMetrics.gamesPlayed > 0
							? modeMetrics.gamesWon / modeMetrics.gamesPlayed
							: 0,
					bestScore: modeMetrics.bestScore,
					averageScore: modeMetrics.averageScore
				};
			})
		);

		// Find most recent calculation date
		const mostRecent = metrics.reduce((latest: Date, m) => {
			const calcDate =
				m.lastCalculationDate instanceof Date
					? m.lastCalculationDate
					: new Date(m.lastCalculationDate);
			return calcDate > latest ? calcDate : latest;
		}, new Date(0));

		return {
			entries,
			total,
			lastUpdated: mostRecent
		};
	}

	/**
	 * Get user's rankings across all game modes
	 */
	async getUserRankings(userId: string): Promise<
		Record<
			GameMode,
			{
				rank?: number;
				rating: number;
				gamesPlayed: number;
				winRate: number;
			}
		>
	> {
		const metrics = await this.getUserMetrics(userId);
		const modes = Object.values(gameModeEnum);
		const rankings: any = {};

		for (const mode of modes) {
			const modeMetrics = (metrics as any)[mode];

			if (modeMetrics) {
				rankings[mode] = {
					rank: modeMetrics.rank,
					rating: modeMetrics.glickoRating.rating,
					gamesPlayed: modeMetrics.gamesPlayed,
					winRate:
						modeMetrics.gamesPlayed > 0
							? modeMetrics.gamesWon / modeMetrics.gamesPlayed
							: 0
				};
			}
		}

		return rankings;
	}
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
