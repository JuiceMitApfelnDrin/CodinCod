import { z } from "zod";
import { ProblemTypeEnum } from "../enum/problem-type-enum.js";
import { REPORT_CONFIG } from "../config/report-config.js";

/**
 * @property {string} problematicIdentifier - The ID of the user or puzzle that is being reported. This field identifies which entity is problematic.
 * @property {string} userId - The ID of the user submitting the report. This helps in associating the report with the reporting user.
 * @property {string} explanation - A detailed explanation or reason for the report. This field provides context on why the entity is being reported.
 *
 * @description
 * The `reportSchema` defines the structure and validation rules for user reports in the system. It ensures that reports include necessary details and adhere to specified constraints.
 *
 * - **Validation Rules:**
 *   - **`problematicIdentifier`:** Must be a non-empty string representing the ID of the entity being reported.
 *   - **`userId`:** Must be a non-empty string identifying the user who is making the report.
 *   - **`explanation`:**
 *     - Minimum length: At least `REPORT_CONFIG.minLengthExplanation` characters.
 *     - Maximum length: No more than `REPORT_CONFIG.maxLengthExplanation` characters.
 *     - Allowed characters: Letters, numbers, hyphens, underscores, and at-signs only. Validated using the regex pattern from `REPORT_CONFIG.allowedCharacters`.
 *
 * @example
 * // Example of a valid report object
 * const report = {
 *   problematicIdentifier: "puzzle123",
 *   userId: "user456",
 *   explanation: "Puzzle contains incorrect test cases. Please review."
 * };
 */
export const reportSchema = z.object({
	problematicIdentifier: z.string(),
	problemType: z.enum([ProblemTypeEnum.PUZZLE, ProblemTypeEnum.USER]),
	userId: z.string(),
	explanation: z
		.string()
		.min(REPORT_CONFIG.minLengthExplanation)
		.max(REPORT_CONFIG.maxLengthExplanation)
		.regex(
			REPORT_CONFIG.allowedCharacters,
			"Explanation can only contain letters, numbers, hyphens, underscores and at-signs"
		)
});
export type Report = z.infer<typeof reportSchema>;
