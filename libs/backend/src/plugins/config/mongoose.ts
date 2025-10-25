import { FastifyInstance } from "fastify";
import mongoose from "mongoose";

export default async function mongooseConnector(fastify: FastifyInstance) {
	const uri = process.env.MONGO_URI;
	const dbName = process.env.MONGO_DB_NAME;

	if (!uri) {
		throw new Error("MONGO_URI is not defined in environment variables");
	}

	try {
		console.log("Connecting to MongoDB...");
		await mongoose.connect(uri, { 
			dbName: dbName ?? "codincod",
			serverSelectionTimeoutMS: 5*1000,
			connectTimeoutMS: 10*1000
		});
		console.log("MongoDB connected successfully!");
		mongoose.connection.on("connected", () => {
			fastify.log.info({ actor: "MongoDB" }, "connected");
		});
		mongoose.connection.on("disconnected", () => {
			fastify.log.error({ actor: "MongoDB" }, "disconnected");
		});
	} catch (error) {
		console.error(`MongoDB connection error:`, error);
		fastify.log.error(`MongoDB connection error (${error})`);
		process.exit(1);
	}

	fastify.decorate("mongoose", mongoose);
}
