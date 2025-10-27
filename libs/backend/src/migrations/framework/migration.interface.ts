/**
 * Interface for all database migrations
 * Each migration must implement this interface to be run by the migration system
 */
export interface Migration {
	/**
	 * Unique name/identifier for this migration
	 * Format: YYYY-MM-DD-descriptive-name
	 * Example: "2025-10-26-add-programming-language-entity"
	 */
	name: string;

	/**
	 * Description of what this migration does
	 */
	description: string;

	/**
	 * Execute the migration
	 * This should be idempotent - safe to run multiple times
	 */
	up(): Promise<void>;

	/**
	 * Rollback the migration (optional)
	 * If not implemented, rollback is not supported for this migration
	 */
	down?(): Promise<void>;
}
