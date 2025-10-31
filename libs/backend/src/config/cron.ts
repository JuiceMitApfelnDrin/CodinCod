import cron from "node-cron";
import { leaderboardService } from "../services/leaderboard.service.js";
import { FastifyInstance } from "fastify";

/**
 * Initialize cron jobs for leaderboard calculations
 * Runs every hour on the hour
 */
export function initializeLeaderboardCron(fastify: FastifyInstance): void {
	// Run every hour at minute 0
	// Cron format: minute hour day month weekday
	const cronExpression = "0 * * * *"; // Every hour at :00

	cron.schedule(cronExpression, async () => {
		fastify.log.info("Starting hourly leaderboard recalculation...");

		try {
			const startTime = Date.now();
			const results = await leaderboardService.recalculateAllLeaderboards();
			const duration = Date.now() - startTime;

			fastify.log.info(
				{
					processedGames: results.processedGames,
					totalProcessed: results.totalProcessed,
					durationMs: duration
				},
				"Leaderboard recalculation completed"
			);
		} catch (error) {
			fastify.log.error(
				{
					err: error
				},
				"Error during leaderboard recalculation"
			);
		}
	});

	fastify.log.info(
		{
			schedule: cronExpression,
			description: "Hourly leaderboard recalculation"
		},
		"Leaderboard cron job initialized"
	);
}
