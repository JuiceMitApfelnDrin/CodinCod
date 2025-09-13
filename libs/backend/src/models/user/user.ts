import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { DEFAULT_USER_ROLES, UserEntity } from "types";
import bcrypt from "bcryptjs";
import { USER } from "../../utils/constants/model.js";
import { profileSchema } from "./user-profile.js";

export interface UserDocument extends Document, UserEntity {
	_id: ObjectId;
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
	roles: {
		type: [
			{
				type: String,
				trim: true
			}
		],
		required: false,
		default: () => DEFAULT_USER_ROLES
	}
});

// Pre-save hook to hash password
userSchema.pre<UserDocument>("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}

	next();
});

const User = mongoose.model<UserDocument>(USER, userSchema);
export default User;
