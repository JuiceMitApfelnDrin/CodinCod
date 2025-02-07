import { FastifyInstance } from "fastify";
import mongoose from "mongoose";

export default async function mongooseConnector(fastify: FastifyInstance) {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME;

	if (!uri) {
		throw new Error("MONGO_URI is not defined in environment variables");
	}

	try {
		await mongoose.connect(uri, { dbName: dbName });
		mongoose.connection.on("connected", () => {
			fastify.log.info({ actor: "MongoDB" }, "connected");
		});
		mongoose.connection.on("disconnected", () => {
			fastify.log.error({ actor: "MongoDB" }, "disconnected");
		});
	} catch (error) {
		fastify.log.error(`MongoDB connection error (${error})`);
		process.exit(1);
	}

	fastify.decorate("mongoose", mongoose);
}
