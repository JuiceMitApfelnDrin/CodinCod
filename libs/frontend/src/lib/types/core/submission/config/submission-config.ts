/**
 * Code submission validation configuration.
 * Extracted from Elixir OpenAPI schema (submission.ex).
 */
export const SUBMISSION_CONFIG = {
	/** Minimum code length in characters */
	minCodeLength: 1,
	/** Minimum total test cases */
	minTotalTests: 1
} as const;

export type SubmissionConfig = typeof SUBMISSION_CONFIG;
