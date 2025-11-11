/**
 * Test constants for E2E tests
 *
 * Centralized constants to ensure consistency across all tests
 */

/**
 * Default test password that meets backend requirements:
 * - At least 14 characters long
 * - Contains uppercase, lowercase, numbers, and special characters
 */
export const TEST_PASSWORD = "TestPassword123!@#";

/**
 * Alternative test password for negative test cases
 */
export const WEAK_PASSWORD = "weak";

/**
 * Invalid credentials for testing failed login
 */
export const INVALID_CREDENTIALS = {
	username: "nonexistent_user_12345",
	password: "WrongPassword123!@#",
} as const;
