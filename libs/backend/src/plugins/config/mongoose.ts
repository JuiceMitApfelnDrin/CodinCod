import { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { MigrationRunner } from "../../migrations/migration-runner.js";
import { allMigrations } from "../../migrations/index.js";
import { DEFAULT_DB_NAME } from "@/config/constants.js";

export default async function mongooseConnector(fastify: FastifyInstance) {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME;

	if (!uri) {
		throw new Error("MONGO_URI is not defined in environment variables");
	}

	try {
		await mongoose.connect(uri, { dbName: dbName ?? DEFAULT_DB_NAME });
		mongoose.connection.on("connected", () => {
			fastify.log.info({ actor: "MongoDB" }, "connected");
		});
		mongoose.connection.on("disconnected", () => {
			fastify.log.error({ actor: "MongoDB" }, "disconnected");
		});

		// Run migrations after connection is established
		const migrationRunner = new MigrationRunner(mongoose.connection);
		await migrationRunner.runMigrations(allMigrations);
	} catch (error) {
		fastify.log.error(`MongoDB connection error (${error})`);
		process.exit(1);
	}

	fastify.decorate("mongoose", mongoose);
}
