import { z } from "zod";

/**
 * @property {number} totalAttempts - The total number of attempts made by users on the puzzle. Each time a user tries to solve the puzzle, this counter is incremented by one. Default value is `0`.
 * @property {number} successfulAttempts - The number of successful attempts where users correctly solve the puzzle. This count is incremented each time a user successfully submits a correct solution. Default value is `0`.
 *
 * @description
 * The `puzzleMetrics` schema is designed to encapsulate performance-related statistics for a puzzle. It tracks the interaction metrics that help in evaluating the puzzle's difficulty and performance over time.
 *
 * - **Purpose:**
 *   - **Track Engagement:** Measures how many users have interacted with the puzzle and how many have successfully solved it.
 *   - **Calculate Success Rate:** Enables the calculation of the success rate, which is the percentage of successful attempts relative to total attempts. This rate helps in determining the puzzle's difficulty level.
 *   - **Dynamic Difficulty Adjustment:** Provides data necessary for dynamically adjusting the puzzle's difficulty based on user performance metrics.
 *   - **Performance Analysis:** Allows for analyzing the puzzle's performance and user engagement, helping in making data-driven decisions for maintaining and improving the puzzle.
 *
 * @example
 * // Example of metrics object
 * const puzzleMetrics = {
 *   totalAttempts: 50,
 *   successfulAttempts: 20
 * };
 */
export const puzzleMetricsSchema = z.object({
	totalAttempts: z.number().default(0),
	successfulAttempts: z.number().default(0),
	upvote: z.number().default(0),
	downvote: z.number().default(0)
});
export type PuzzleMetrics = z.infer<typeof puzzleMetricsSchema>;
