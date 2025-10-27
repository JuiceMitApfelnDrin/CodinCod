import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_USER_ROLE, UserEntity } from "types";
import bcrypt from "bcryptjs";
import { USER, USER_BAN } from "../../utils/constants/model.js";
import { profileSchema } from "./user-profile.js";

export interface UserDocument extends Document, Omit<UserEntity, "currentBan"> {
	currentBan?: mongoose.Types.ObjectId | null;
}

const userSchema = new Schema<UserDocument>({
	createdAt: {
		default: Date.now,
		type: Date
	},
	email: {
		lowercase: true,
		required: true,
		trim: true,
		type: String,
		unique: true,
		select: false,
		index: true
	},
	password: {
		required: true,
		type: String,
		select: false
	},
	updatedAt: {
		default: Date.now,
		type: Date
	},
	username: {
		required: true,
		trim: true,
		type: String,
		unique: true,
		index: true
	},
	profile: {
		type: profileSchema,
		required: false
	},
	role: {
		type: String,
		trim: true,
		required: false,
		default: () => DEFAULT_USER_ROLE
	},
	reportCount: {
		type: Number,
		default: 0,
		min: 0,
		select: false
	},
	banCount: {
		type: Number,
		default: 0,
		min: 0,
		select: false
	},
	currentBan: {
		type: Schema.Types.ObjectId,
		ref: USER_BAN,
		required: false,
		default: null
	}
});

// Pre-save hook to hashlutino password
userSchema.pre<UserDocument>("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}

	next();
});

const User = mongoose.model<UserDocument>(USER, userSchema);
export default User;
