import mongoose, { Document, Schema } from "mongoose";
import { UserEntity } from "types";
import bcrypt from "bcrypt";
import { USER } from "../../utils/constants/model.js";

interface UserDocument extends Document, UserEntity {}

const profileSchema = new Schema({
	picture: {
		type: String,
		required: false,
		trim: true
	},
	bio: {
		type: String,
		required: false,
		trim: true
	},
	location: {
		type: String,
		required: false,
		trim: true
	},
	socials: {
		required: false,
		type: [
			{
				type: String,
				trim: true
			}
		]
	}
});

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
		unique: true
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
		unique: true
	},
	profile: {
		type: profileSchema,
		required: false
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
