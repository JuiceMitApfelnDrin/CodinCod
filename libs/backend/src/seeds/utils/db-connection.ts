import mongoose from "mongoose";
import { config } from "dotenv";
config();

export async function connectToDatabase(): Promise<void> {
	const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
	const dbName = process.env.MONGO_DB_NAME || "codincod";

	try {
		await mongoose.connect(mongoUri, {
			dbName,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000
		});
		
		console.log(`✅ Connected to MongoDB: ${dbName}`);
	} catch (error) {
		console.error("❌ MongoDB connection error:", error);
		throw error;
	}
}
export async function disconnectFromDatabase(): Promise<void> {
	await mongoose.disconnect();
	console.log("✅ Disconnected from MongoDB");
}
