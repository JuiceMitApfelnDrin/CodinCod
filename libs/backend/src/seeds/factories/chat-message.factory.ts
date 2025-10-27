import { faker } from "@faker-js/faker";
import ChatMessage from "../../models/chat/chat-message.js";
import User from "../../models/user/user.js";
import { ChatMessageEntity } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";

export interface ChatMessageFactoryOptions {
	gameId: Types.ObjectId;
	userId: Types.ObjectId;
	username?: string;
}

/**
 * Generate realistic game chat messages
 */
function generateChatMessage(): string {
	const messageTemplates = [
		() => "Good luck everyone!",
		() => "GL HF!",
		() => `Nice approach!`,
		() =>
			`${faker.helpers.arrayElement(["Interesting", "Cool", "Smart"])} solution`,
		() =>
			`Anyone using ${randomFromArray(["Python", "JavaScript", "Java", "C++"])}?`,
		() => "GG",
		() => "Well played!",
		() =>
			`This puzzle is ${faker.helpers.arrayElement(["tough", "tricky", "interesting", "fun"])}!`,
		() => `${faker.number.int({ min: 1, max: 100 })}% done`,
		() => "Almost there!",
		() => "First time playing this mode",
		() => `Time's running out!`,
		() => `Let's do this!`,
		() => faker.helpers.arrayElement(["😊", "👍", "🎉", "🔥", "💪"]),
		() => `${faker.helpers.arrayElement(["Found", "Got", "Solved"])} it!`,
		() => "Quick question about the constraints",
		() => `Testing edge case ${faker.number.int({ min: 1, max: 10 })}`,
		() => "Thanks for the game!",
		() => "Rematch?",
		() => `Love this ${randomFromArray(["puzzle", "challenge", "problem"])}`
	];

	return randomFromArray(messageTemplates)();
}

/**
 * Create a single chat message
 */
export async function createChatMessage(
	options: ChatMessageFactoryOptions
): Promise<Types.ObjectId> {
	let username = options.username;

	// If username not provided, fetch it from the user
	if (!username) {
		const user = await User.findById(options.userId).select("username");
		if (!user) throw new Error("User not found for chat message");
		username = user.username;
	}

	const chatMessageData: Partial<ChatMessageEntity> = {
		gameId: options.gameId.toString(),
		userId: options.userId.toString(),
		username,
		message: generateChatMessage(),
		isDeleted: faker.datatype.boolean({ probability: 0.05 }), // 5% deleted messages
		createdAt: faker.date.recent({ days: 30 }),
		updatedAt: faker.date.recent({ days: 30 })
	};

	const chatMessage = new ChatMessage(chatMessageData);
	await chatMessage.save();

	return chatMessage._id as Types.ObjectId;
}

/**
 * Create chat messages for a game
 */
export async function createChatMessagesForGame(
	gameId: Types.ObjectId,
	playerIds: Types.ObjectId[],
	messageCount: number = 10
): Promise<Types.ObjectId[]> {
	const chatMessageIds: Types.ObjectId[] = [];

	// Fetch usernames once for all players
	const users = await User.find({ _id: { $in: playerIds } })
		.select("_id username")
		.lean();
	const userMap = new Map(
		users.map((u) => [(u._id as Types.ObjectId).toString(), u.username])
	);

	for (let i = 0; i < messageCount; i++) {
		const userId = randomFromArray(playerIds);
		const username = userMap.get(userId.toString());

		if (!username) continue;

		chatMessageIds.push(
			await createChatMessage({
				gameId,
				userId,
				username
			})
		);
	}

	return chatMessageIds;
}

/**
 * Create chat messages for multiple games
 */
export async function createChatMessages(
	gameIds: Types.ObjectId[],
	gamePlayerMap: Map<string, Types.ObjectId[]>
): Promise<Types.ObjectId[]> {
	const chatMessageIds: Types.ObjectId[] = [];

	for (const gameId of gameIds) {
		const playerIds = gamePlayerMap.get(gameId.toString());
		if (!playerIds || playerIds.length === 0) continue;

		// Each game gets 5-20 messages
		const messageCount = faker.number.int({ min: 5, max: 20 });
		const messages = await createChatMessagesForGame(
			gameId,
			playerIds,
			messageCount
		);
		chatMessageIds.push(...messages);
	}

	return chatMessageIds;
}
