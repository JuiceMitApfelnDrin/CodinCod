import { z } from "zod";
import { ProblemTypeEnum } from "../enum/problem-type-enum.js";
import { REPORT_CONFIG } from "../config/report-config.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { reviewStatusEnum } from "../enum/review-status-enum.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

/**
 * @property {string} problematicIdentifier - The ID of the user, puzzle, or comment that is being reported. This field identifies which entity is problematic.
 * @property {string} reportedBy - The ID of the user submitting the report. This helps in associating the report with the reporting user.
 * @property {string} explanation - A detailed explanation or reason for the report. This field provides context on why the entity is being reported.
 * @property {string} status - The current status of the report (pending, resolved, rejected).
 * @property {string} resolvedBy - The ID of the moderator who resolved the report (optional).
 *
 * @description
 * The `reportEntitySchema` defines the structure and validation rules for user reports in the system. It ensures that reports include necessary details and adhere to specified constraints.
 *
 * - **Validation Rules:**
 *   - **`problematicIdentifier`:** Must be a non-empty string representing the ID of the entity being reported.
 *   - **`reportedBy`:** Must be a non-empty string identifying the user who is making the report.
 *   - **`explanation`:**
 *     - Minimum length: At least `REPORT_CONFIG.minLengthExplanation` characters.
 *     - Maximum length: No more than `REPORT_CONFIG.maxLengthExplanation` characters.
 *     - Allowed characters: Letters, numbers, hyphens, underscores, and at-signs only. Validated using the regex pattern from `REPORT_CONFIG.allowedCharacters`.
 *
 * @example
 * // Example of a valid report object
 * const report = {
 *   problematicIdentifier: "puzzle123",
 *   reportedBy: "user456",
 *   problemType: "puzzle",
 *   explanation: "Puzzle contains incorrect test cases. Please review.",
 *   status: "pending"
 * };
 */
export const reportEntitySchema = z.object({
	problematicIdentifier: objectIdSchema,
	problemType: z.enum([
		ProblemTypeEnum.PUZZLE,
		ProblemTypeEnum.USER,
		ProblemTypeEnum.COMMENT,
	]),
	reportedBy: objectIdSchema,
	explanation: z
		.string()
		.min(REPORT_CONFIG.minLengthExplanation)
		.max(REPORT_CONFIG.maxLengthExplanation)
		.regex(
			REPORT_CONFIG.allowedCharacters,
			"Explanation can only contain letters, numbers, hyphens, underscores and at-signs",
		),
	status: z
		.enum([
			reviewStatusEnum.PENDING,
			reviewStatusEnum.RESOLVED,
			reviewStatusEnum.REJECTED,
		])
		.prefault(reviewStatusEnum.PENDING),
	resolvedBy: objectIdSchema.optional(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
});
export type ReportEntity = z.infer<typeof reportEntitySchema>;

// Schema for creating a new report
export const createReportSchema = reportEntitySchema.pick({
	problematicIdentifier: true,
	problemType: true,
	explanation: true,
});
export type CreateReport = z.infer<typeof createReportSchema>;

// Schema for resolving a report
export const resolveReportSchema = z.object({
	status: z.enum([reviewStatusEnum.RESOLVED, reviewStatusEnum.REJECTED]),
});
export type ResolveReport = z.infer<typeof resolveReportSchema>;
