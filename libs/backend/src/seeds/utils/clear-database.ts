import User from "../../models/user/user.js";
import Puzzle from "../../models/puzzle/puzzle.js";
import Submission from "../../models/submission/submission.js";
import Comment from "../../models/comment/comment.js";
import Game from "../../models/game/game.js";
import Report from "../../models/report/report.js";
import Preferences from "../../models/preferences/preferences.js";
import UserBan from "../../models/moderation/user-ban.js";
import UserVote from "../../models/user/user-vote.js";
import ChatMessage from "../../models/chat/chat-message.js";
import readline from "readline/promises";

export async function clearDatabase(force = false): Promise<void> {
	if (!force) {
		const counts = await getCollectionCounts();
		console.log("Current collection counts:", counts);

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		const answer = await rl.question(
			"⚠️  This will DELETE ALL DATA from the database. Are you sure? (yes/no): "
		);
		rl.close();

		if (answer.toLowerCase() !== "yes") {
			console.log("❌ Database clear cancelled");
			return;
		}
	}

	console.log("🗑️  Clearing database...");

	try {
		// Delete in reverse dependency order
		await Promise.all([
			ChatMessage.deleteMany({}),
			UserVote.deleteMany({}),
			Report.deleteMany({}),
			Game.deleteMany({})
		]);

		await Promise.all([Comment.deleteMany({}), Submission.deleteMany({})]);

		await Puzzle.deleteMany({});

		await Promise.all([UserBan.deleteMany({}), Preferences.deleteMany({})]);

		await User.deleteMany({});

		console.log("✅ Database cleared successfully");
	} catch (error) {
		console.error("❌ Error clearing database:", error);
		throw error;
	}
}

export async function getCollectionCounts(): Promise<Record<string, number>> {
	const counts = {
		users: await User.countDocuments(),
		puzzles: await Puzzle.countDocuments(),
		submissions: await Submission.countDocuments(),
		comments: await Comment.countDocuments(),
		games: await Game.countDocuments(),
		reports: await Report.countDocuments(),
		preferences: await Preferences.countDocuments(),
		userBans: await UserBan.countDocuments(),
		userVotes: await UserVote.countDocuments(),
		chatMessages: await ChatMessage.countDocuments()
	};

	return counts;
}
