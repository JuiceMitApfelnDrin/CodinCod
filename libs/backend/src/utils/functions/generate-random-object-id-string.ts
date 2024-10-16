import mongoose from "mongoose";

export function generateRandomObjectIdString() {
	return new mongoose.Types.ObjectId().toString();
}
