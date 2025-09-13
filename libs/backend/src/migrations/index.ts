import { Migration } from "./migration-runner.js";
import { migration001 } from "./001-initial-baseline.js";

// Export all migrations in order
export const allMigrations: Migration[] = [
	migration001
	// Add new migrations here
];

// Export individual migrations
export { migration001 };
