import {
	getBanDuration,
	shouldAutoBan,
	shouldBePermanent,
	banTypeEnum,
	ObjectId
} from "types";
import UserBan from "../../models/moderation/user-ban.js";
import User from "../../models/user/user.js";
import mongoose from "mongoose";

export async function applyAutomaticEscalation(
	userId: ObjectId,
	moderatorId: ObjectId,
	reason: string
): Promise<typeof UserBan.prototype | null> {
	const user = await User.findById(userId);

	if (!user) {
		throw new Error("User not found");
	}

	const reportCount = user.reportCount || 0;

	if (!shouldAutoBan(reportCount)) {
		return null;
	}

	const isPermanent = shouldBePermanent(reportCount);
	const durationMs = getBanDuration(reportCount);

	const banData = {
		userId: new mongoose.Types.ObjectId(userId),
		bannedBy: new mongoose.Types.ObjectId(moderatorId),
		banType: isPermanent ? banTypeEnum.PERMANENT : banTypeEnum.TEMPORARY,
		reason: `Automatic escalation: ${reason}`,
		startDate: new Date(),
		endDate: durationMs ? new Date(Date.now() + durationMs) : undefined,
		isActive: true
	};

	const ban = new UserBan(banData);
	const savedBan = await ban.save();

	user.banCount = (user.banCount || 0) + 1;
	user.currentBan = savedBan._id as mongoose.Types.ObjectId;
	await user.save();

	return savedBan;
}

export async function checkUserBanStatus(
	userId: ObjectId
): Promise<{ isBanned: boolean; ban?: typeof UserBan.prototype }> {
	const user = await User.findById(userId).populate("currentBan");

	if (!user || !user.currentBan) {
		return { isBanned: false };
	}

	const ban = await UserBan.findById(user.currentBan);

	if (!ban || !ban.isActive) {
		user.currentBan = null;
		await user.save();
		return { isBanned: false };
	}

	if (ban.banType === banTypeEnum.TEMPORARY && ban.endDate) {
		if (new Date() > ban.endDate) {
			ban.isActive = false;
			await ban.save();
			user.currentBan = null;
			await user.save();
			return { isBanned: false };
		}
	}

	return { isBanned: true, ban };
}

/**
 * Manually unban a user
 */
export async function unbanUser(
	userId: ObjectId,
	moderatorId: ObjectId,
	reason: string
): Promise<void> {
	const user = await User.findById(userId);

	if (!user || !user.currentBan) {
		throw new Error("User is not currently banned");
	}

	const ban = await UserBan.findById(user.currentBan);

	if (ban) {
		ban.isActive = false;
		ban.reason = `${ban.reason} | Unbanned by moderator: ${reason}`;
		await ban.save();
	}

	user.currentBan = null;
	await user.save();
}

export async function createTemporaryBan(
	userId: ObjectId,
	moderatorId: ObjectId,
	reason: string,
	durationMs: number
): Promise<typeof UserBan.prototype> {
	const user = await User.findById(userId);

	if (!user) {
		throw new Error("User not found");
	}

	// Deactivate any existing ban
	if (user.currentBan) {
		const existingBan = await UserBan.findById(user.currentBan);
		if (existingBan) {
			existingBan.isActive = false;
			await existingBan.save();
		}
	}

	const ban = new UserBan({
		userId: new mongoose.Types.ObjectId(userId),
		bannedBy: new mongoose.Types.ObjectId(moderatorId),
		banType: banTypeEnum.TEMPORARY,
		reason,
		startDate: new Date(),
		endDate: new Date(Date.now() + durationMs),
		isActive: true
	});

	const savedBan = await ban.save();

	user.banCount = (user.banCount || 0) + 1;
	user.currentBan = savedBan._id as mongoose.Types.ObjectId;
	await user.save();

	return savedBan;
}

export async function createPermanentBan(
	userId: ObjectId,
	moderatorId: ObjectId,
	reason: string
): Promise<typeof UserBan.prototype> {
	const user = await User.findById(userId);

	if (!user) {
		throw new Error("User not found");
	}

	// Deactivate any existing ban
	if (user.currentBan) {
		const existingBan = await UserBan.findById(user.currentBan);
		if (existingBan) {
			existingBan.isActive = false;
			await existingBan.save();
		}
	}

	const ban = new UserBan({
		userId: new mongoose.Types.ObjectId(userId),
		bannedBy: new mongoose.Types.ObjectId(moderatorId),
		banType: banTypeEnum.PERMANENT,
		reason,
		startDate: new Date(),
		isActive: true
	});

	const savedBan = await ban.save();

	user.banCount = (user.banCount || 0) + 1;
	user.currentBan = savedBan._id as mongoose.Types.ObjectId;
	await user.save();

	return savedBan;
}

export async function incrementReportCount(userId: ObjectId): Promise<number> {
	const user = await User.findById(userId);

	if (!user) {
		throw new Error("User not found");
	}

	user.reportCount = (user.reportCount || 0) + 1;
	await user.save();

	return user.reportCount;
}
