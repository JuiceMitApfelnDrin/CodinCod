import User, { UserDocument } from "../models/user/user.js";
import { ObjectId, UserDto, UserEntity } from "types";

export class UserService {
	async findById(id: string | ObjectId): Promise<UserDocument | null> {
		return await User.findById(id);
	}

	async findByIdWithBan(id: string | ObjectId): Promise<UserDocument | null> {
		return await User.findById(id).populate("currentBan");
	}

	async findByUsername(username: string): Promise<UserDocument | null> {
		return await User.findOne({ username });
	}

	async findByEmail(email: string): Promise<UserDocument | null> {
		return await User.findOne({ email }).select("+email");
	}

	async findByUsernameWithPassword(username: string): Promise<UserDocument | null> {
		return await User.findOne({ username }).select("+password");
	}

	async create(data: Omit<UserEntity, "createdAt" | "updatedAt">): Promise<UserDocument> {
		const user = new User(data);
		return await user.save();
	}

	async updateProfile(
		id: string | ObjectId,
		profile: Partial<UserEntity["profile"]>
	): Promise<UserDocument | null> {
		return await User.findByIdAndUpdate(id, { $set: { profile } }, { new: true });
	}

	async usernameExists(username: string): Promise<boolean> {
		const count = await User.countDocuments({ username });
		return count > 0;
	}

	async emailExists(email: string): Promise<boolean> {
		const count = await User.countDocuments({ email });
		return count > 0;
	}

	async updateBan(userId: string | ObjectId, banId: ObjectId | null): Promise<void> {
		await User.findByIdAndUpdate(userId, { currentBan: banId });
	}

	async incrementReportCount(userId: string | ObjectId): Promise<void> {
		await User.findByIdAndUpdate(userId, { $inc: { reportCount: 1 } });
	}

	async findMany(ids: (string | ObjectId)[]): Promise<UserDocument[]> {
		return await User.find({ _id: { $in: ids } });
	}

	toDto(user: UserDocument): UserDto {
		return {
			_id: (user._id as ObjectId).toString(),
			username: user.username,
			profile: user.profile,
			createdAt: user.createdAt
		};
	}
}

export const userService = new UserService();
