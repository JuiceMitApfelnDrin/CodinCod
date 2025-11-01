import { GameMode, gameModeEnum } from "types";
import {
	getGameModeConfig,
	sortSubmissionsByGameMode,
	type SubmissionData
} from "../utils/game-mode/game-mode-strategy.js";
import { GameDocument } from "../models/game/game.js";
import { SubmissionDocument } from "../models/submission/submission.js";
import type { ObjectId } from "mongoose";

type PopulatedSubmission = Omit<SubmissionDocument, "user"> & {
	user: ObjectId | { _id: ObjectId; username: string };
};

function isPopulatedUser(
	user: ObjectId | { _id: ObjectId; username: string }
): user is { _id: ObjectId; username: string } {
	return (
		typeof user === "object" &&
		user !== null &&
		"_id" in user &&
		"username" in user
	);
}

/**
 * Service for game mode logic
 * Handles scoring, ranking, and game mode-specific business logic
 */
export class GameModeService {
	/**
	 * Calculate score for a submission based on game mode
	 */
	calculateSubmissionScore(
		mode: GameMode,
		submission: {
			result: { successRate: number };
			createdAt: Date | string;
			code: string;
			gameStartTime: Date | string;
			attempts?: number;
		}
	): number {
		const config = getGameModeConfig(mode);
		const startTime = new Date(submission.gameStartTime).getTime();
		const submissionTime = new Date(submission.createdAt).getTime();
		const timeSpent = (submissionTime - startTime) / 1000; // Convert to seconds

		const submissionData: SubmissionData = {
			successRate: submission.result.successRate,
			timeSpent,
			codeLength: submission.code.length,
			attempts: submission.attempts ?? undefined
		};

		return config.calculateScore(submissionData);
	}

	/**
	 * Get leaderboard for a game based on its mode
	 */
	getGameLeaderboard(
		game: GameDocument,
		submissions: Array<PopulatedSubmission & { attempts?: number }>
	): Array<{
		userId: string;
		username: string;
		score: number;
		timeSpent: number;
		codeLength?: number;
		successRate: number;
		rank: number;
	}> {
		const mode = game.options?.mode ?? gameModeEnum.FASTEST;

		const sortedSubmissions = sortSubmissionsByGameMode(
			submissions,
			mode,
			game.createdAt
		);

		return sortedSubmissions.map((submission, index) => {
			const userId = isPopulatedUser(submission.user)
				? submission.user._id.toString()
				: submission.user.toString();

			const username = isPopulatedUser(submission.user)
				? submission.user.username
				: "";

			const startTime = new Date(game.createdAt).getTime();
			const submissionTime = new Date(submission.createdAt).getTime();
			const timeSpent = (submissionTime - startTime) / 1000;

			const submissionData: SubmissionData = {
				successRate: submission.result.successRate,
				timeSpent,
				codeLength: submission.code?.length ?? 0,
				attempts: submission.attempts
			};

			const config = getGameModeConfig(mode);
			const score = config.calculateScore(submissionData);

			return {
				userId,
				username,
				score,
				timeSpent,
				codeLength: submission.code?.length ?? 0,
				successRate: submission.result.successRate,
				rank: index + 1
			};
		});
	}

	/**
	 * Get display metrics for a game mode
	 */
	getDisplayMetricsForMode(mode: GameMode): string[] {
		const config = getGameModeConfig(mode);
		return config.displayMetrics;
	}

	/**
	 * Validate submission based on game mode rules
	 */
	validateSubmissionForMode(
		mode: GameMode,
		submission: {
			result: { successRate: number };
			attempts?: number;
		}
	): { valid: boolean; reason?: string } {
		switch (mode) {
			case gameModeEnum.HARDCORE:
				// Hardcore mode: only one attempt allowed
				if ((submission.attempts ?? 1) > 1) {
					return {
						valid: false,
						reason:
							"Hardcore mode allows only one attempt. This submission has multiple attempts."
					};
				}
				break;

			case gameModeEnum.BACKWARDS:
			case gameModeEnum.DEBUG:
				break;

			case gameModeEnum.INCREMENTAL:
				// Incremental mode accepts partial success
				if (submission.result.successRate === 0) {
					return {
						valid: false,
						reason: "Incremental mode requires at least partial success."
					};
				}
				break;

			case gameModeEnum.FASTEST:
			case gameModeEnum.SHORTEST:
			case gameModeEnum.EFFICIENCY:
			case gameModeEnum.TYPERACER:
			case gameModeEnum.RANDOM:
			default:
				// Most modes require full success
				if (submission.result.successRate < 1) {
					return {
						valid: false,
						reason: "Submission must pass all test cases for this game mode."
					};
				}
		}

		return { valid: true };
	}

	/**
	 * Get game mode description for UI
	 */
	getGameModeDescription(mode: GameMode): string {
		switch (mode) {
			case gameModeEnum.FASTEST:
				return "Complete the puzzle in the shortest time";
			case gameModeEnum.SHORTEST:
				return "Write the solution with the fewest characters";
			case gameModeEnum.BACKWARDS:
				return "Work from output to input - logical deduction challenge";
			case gameModeEnum.HARDCORE:
				return "One attempt only - no test runs allowed";
			case gameModeEnum.DEBUG:
				return "Fix broken code with minimal changes";
			case gameModeEnum.EFFICIENCY:
				return "Write the most computationally efficient solution";
			case gameModeEnum.TYPERACER:
				return "Copy code perfectly at maximum speed";
			case gameModeEnum.INCREMENTAL:
				return "Progressive requirements - solve step by step";
			case gameModeEnum.RANDOM:
				return "Random mode - a surprise challenge";
			default:
				return "Complete the challenge";
		}
	}

	/**
	 * Resolve random mode to actual mode
	 */
	resolveGameMode(mode: GameMode): GameMode {
		if (mode !== gameModeEnum.RANDOM) {
			return mode;
		}

		// Select a random mode (excluding RANDOM itself)
		const modes = Object.values(gameModeEnum).filter(
			(m) => m !== gameModeEnum.RANDOM
		);
		const randomIndex = Math.floor(Math.random() * modes.length);
		return modes[randomIndex] as GameMode;
	}
}

// Export singleton instance
export const gameModeService = new GameModeService();
