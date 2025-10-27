import { Migration } from "./migration.interface.js";
import { migrationStatus, MigrationTracker } from "./migration-tracker.js";

/**
 * Migration runner that executes migrations in order
 */
export class MigrationRunner {
	private migrations: Migration[] = [];

	/**
	 * Register a migration to be run
	 */
	register(migration: Migration): void {
		this.migrations.push(migration);
	}

	/**
	 * Run all pending migrations
	 */
	async runAll(): Promise<void> {
		console.log("🔄 Checking for pending migrations...\n");

		// Sort migrations by name (which should be date-prefixed)
		this.migrations.sort((a, b) => a.name.localeCompare(b.name));

		// Get already applied migrations
		const appliedMigrations = await MigrationTracker.find({
			status: migrationStatus.APPLIED
		}).lean();
		const appliedNames = new Set(appliedMigrations.map((m) => m.name));

		// Filter to pending migrations
		const pendingMigrations = this.migrations.filter(
			(m) => !appliedNames.has(m.name)
		);

		if (pendingMigrations.length === 0) {
			console.log("✅ No pending migrations. Database is up to date.\n");
			return;
		}

		console.log(`Found ${pendingMigrations.length} pending migration(s):\n`);
		pendingMigrations.forEach((m, i) => {
			console.log(`  ${i + 1}. ${m.name}`);
			console.log(`     ${m.description}\n`);
		});

		// Run each pending migration
		for (const migration of pendingMigrations) {
			await this.runOne(migration);
		}

		console.log("\n✨ All migrations completed successfully!\n");
	}

	/**
	 * Run a specific migration
	 */
	async runOne(migration: Migration): Promise<void> {
		console.log(`\n${"=".repeat(60)}`);
		console.log(`Running migration: ${migration.name}`);
		console.log(`Description: ${migration.description}`);
		console.log("=".repeat(60));

		const startTime = Date.now();

		try {
			// Run the migration
			await migration.up();

			// Record success
			await MigrationTracker.create({
				name: migration.name,
				description: migration.description,
				appliedAt: new Date(),
				status: migrationStatus.APPLIED
			});

			const duration = ((Date.now() - startTime) / 1000).toFixed(2);
			console.log(`\n✅ Migration completed successfully in ${duration}s`);
		} catch (error) {
			// Record failure
			await MigrationTracker.create({
				name: migration.name,
				description: migration.description,
				appliedAt: new Date(),
				status: migrationStatus.FAILED,
				error: error instanceof Error ? error.message : String(error)
			});

			console.error(`\n❌ Migration failed:`, error);
			throw error;
		}
	}

	/**
	 * Rollback the last applied migration
	 */
	async rollbackLast(): Promise<void> {
		const lastMigration = await MigrationTracker.findOne({
			status: migrationStatus.APPLIED
		})
			.sort({ appliedAt: -1 })
			.lean();

		if (!lastMigration) {
			console.log("No migrations to rollback.");
			return;
		}

		const migration = this.migrations.find(
			(m) => m.name === lastMigration.name
		);

		if (!migration) {
			throw new Error(
				`Migration ${lastMigration.name} not found in registered migrations`
			);
		}

		if (!migration.down) {
			throw new Error(`Migration ${migration.name} does not support rollback`);
		}

		console.log(`\nRolling back migration: ${migration.name}\n`);

		try {
			await migration.down();

			await MigrationTracker.findOneAndUpdate(
				{ name: migration.name },
				{
					rollbackAt: new Date(),
					status: migrationStatus.ROLLED_BACK
				}
			);

			console.log(`✅ Rollback completed successfully`);
		} catch (error) {
			console.error(`❌ Rollback failed:`, error);
			throw error;
		}
	}

	/**
	 * List all migrations and their status
	 */
	async list(): Promise<void> {
		const applied = await MigrationTracker.find().sort({ appliedAt: 1 }).lean();

		console.log("\n📋 Migration Status:\n");

		// Sort all migrations by name
		const sortedMigrations = [...this.migrations].sort((a, b) =>
			a.name.localeCompare(b.name)
		);

		for (const migration of sortedMigrations) {
			const record = applied.find((m) => m.name === migration.name);

			if (record) {
				const status =
					record.status === migrationStatus.APPLIED
						? "✅ Applied"
						: record.status === migrationStatus.ROLLED_BACK
							? "⏪ Rolled back"
							: "❌ Failed";
				const date = record.appliedAt.toISOString().split("T")[0];
				console.log(`  ${status} - ${migration.name} (${date})`);
			} else {
				console.log(`  ⏳ Pending - ${migration.name}`);
			}
			console.log(`     ${migration.description}\n`);
		}
	}
}
