import mongoose from "mongoose";

export interface Migration {
	version: number;
	name: string;
	up: (db: mongoose.Connection) => Promise<void>;
	down: (db: mongoose.Connection) => Promise<void>;
}

export class MigrationRunner {
	private db: mongoose.Connection;
	private migrationsCollection = "migrations";

	constructor(db: mongoose.Connection) {
		this.db = db;
	}

	async ensureMigrationsCollection(): Promise<void> {
		if (!this.db.db) {
			throw new Error("Database connection is not available");
		}

		const collections = await this.db.db.listCollections().toArray();
		const exists = collections.some(
			(collection) => collection.name === this.migrationsCollection
		);

		if (!exists) {
			await this.db.db.createCollection(this.migrationsCollection);
			await this.db.db
				.collection(this.migrationsCollection)
				.createIndex({ version: 1 }, { unique: true });
		}
	}

	async getCurrentVersion(): Promise<number> {
		await this.ensureMigrationsCollection();

		if (!this.db.db) {
			throw new Error("Database connection is not available");
		}

		const latestMigration = await this.db.db
			.collection(this.migrationsCollection)
			.findOne({}, { sort: { version: -1 } });

		return latestMigration?.version || 0;
	}

	async markMigrationComplete(migration: Migration): Promise<void> {
		if (!this.db.db) {
			throw new Error("Database connection is not available");
		}

		await this.db.db.collection(this.migrationsCollection).insertOne({
			version: migration.version,
			name: migration.name,
			appliedAt: new Date()
		});
	}

	async markMigrationReverted(version: number): Promise<void> {
		if (!this.db.db) {
			throw new Error("Database connection is not available");
		}

		await this.db.db
			.collection(this.migrationsCollection)
			.deleteOne({ version });
	}

	async runMigrations(migrations: Migration[]): Promise<void> {
		const currentVersion = await this.getCurrentVersion();
		const pendingMigrations = migrations.filter(
			(m) => m.version > currentVersion
		);

		for (const migration of pendingMigrations.sort(
			(a, b) => a.version - b.version
		)) {
			console.log(`Running migration ${migration.version}: ${migration.name}`);

			try {
				await migration.up(this.db);
				await this.markMigrationComplete(migration);
				console.log(`✅ Migration ${migration.version} completed`);
			} catch (error) {
				console.error(`❌ Migration ${migration.version} failed:`, error);
				throw error;
			}
		}

		if (pendingMigrations.length === 0) {
			console.log("✅ All migrations are up to date");
		}
	}

	async rollbackMigration(migration: Migration): Promise<void> {
		console.log(
			`Rolling back migration ${migration.version}: ${migration.name}`
		);

		try {
			await migration.down(this.db);
			await this.markMigrationReverted(migration.version);
			console.log(`✅ Migration ${migration.version} rolled back`);
		} catch (error) {
			console.error(`❌ Rollback ${migration.version} failed:`, error);
			throw error;
		}
	}
}
