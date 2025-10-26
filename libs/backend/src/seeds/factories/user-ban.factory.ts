import { faker } from "@faker-js/faker";
import UserBan from "../../models/moderation/user-ban.js";
import User from "../../models/user/user.js";
import { banTypeEnum, UserBanEntity } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";

type BanTypeValue = (typeof banTypeEnum)[keyof typeof banTypeEnum];

export interface UserBanFactoryOptions {
	userId: Types.ObjectId;
	bannedById: Types.ObjectId;
	banType?: BanTypeValue;
	isActive?: boolean;
}

/**
 * Create a user ban record
 */
export async function createUserBan(
	options: UserBanFactoryOptions
): Promise<Types.ObjectId> {
	const banType =
		options.banType || randomFromArray(Object.values(banTypeEnum));

	const isActive =
		options.isActive ?? faker.datatype.boolean({ probability: 0.7 });

	const startDate = faker.date.recent({ days: 60 });
	const endDate =
		banType === banTypeEnum.TEMPORARY
			? faker.date.future({ years: 0.5, refDate: startDate })
			: undefined;

	const banReasons = [
		"Spamming comments",
		"Inappropriate content",
		"Harassment of other users",
		"Cheating in games",
		"Multiple rule violations",
		"Posting offensive material",
		"Abuse of reporting system"
	];

	const banData: Partial<UserBanEntity> = {
		userId: options.userId.toString(),
		bannedBy: options.bannedById.toString(),
		banType,
		reason: randomFromArray(banReasons),
		startDate,
		endDate,
		isActive
	};

	const userBan = new UserBan(banData);
	await userBan.save();

	// Update user's currentBan if active
	if (isActive) {
		await User.findByIdAndUpdate(options.userId, {
			currentBan: userBan._id,
			$inc: { banCount: 1 }
		});
	}

	return userBan._id as Types.ObjectId;
}

/**
 * Create user bans for some users
 */
export async function createUserBans(
	userIds: Types.ObjectId[],
	moderatorIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const banIds: Types.ObjectId[] = [];

	// Ban 10-15% of users
	const banCount = Math.ceil(userIds.length * 0.12);

	for (let i = 0; i < banCount; i++) {
		const userId = randomFromArray(userIds);
		const bannedById = randomFromArray(moderatorIds);

		// 70% temporary, 30% permanent
		const banTypeValues = Object.values(banTypeEnum);
		const banType = faker.datatype.boolean({ probability: 0.7 })
			? banTypeValues[0] // TEMPORARY
			: banTypeValues[1]; // PERMANENT

		banIds.push(
			await createUserBan({
				userId,
				bannedById,
				banType
			})
		);
	}

	return banIds;
}
