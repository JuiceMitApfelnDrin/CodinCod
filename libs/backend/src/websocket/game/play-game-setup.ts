import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onConnection } from "./on-connection.js";
import { ParamsId } from "@/routes/puzzle/[id]/types.js";
import { ChatMessage, GameEventEnum, isAuthenticatedInfo, isChatMessage } from "types";
import { isValidObjectId } from "mongoose";
import { parseRawDataMessage } from "@/utils/functions/parse-raw-data-message.js";
import Game from "@/models/game/game.js";
import { UserWebSockets } from "./user-web-sockets.js";

const playGame = new UserWebSockets();

export function playGameSetup(
	socket: WebSocket,
	req: FastifyRequest<ParamsId>,
	fastify: FastifyInstance
) {
	const { id } = req.params;

	if (!isAuthenticatedInfo(req.user)) {
		return;
	}
	if (!isValidObjectId(id)) {
		socket.send(
			JSON.stringify({
				socket,
				event: GameEventEnum.NONEXISTENT_GAME,
				message: "invalid id"
			})
		);

		// TODO: give a good reason code
		socket.close();
		return;
	}
	onConnection(playGame, req.user, id, socket);

	if (!isAuthenticatedInfo(req.user)) {
		return;
	}
	socket.on("message", async (message) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		let parsedMessage = parseRawDataMessage(message, socket);

		if (!parsedMessage) {
			return;
		}

		const { event } = parsedMessage;

		switch (event) {
			case GameEventEnum.SUBMITTED_PLAYER:
				{
					if (!isValidObjectId(id)) {
						const data = JSON.stringify({
							event: GameEventEnum.INCORRECT_VALUE,
							message: "invalid id"
						});

						playGame.updateUser(req.user.username, data);
						return;
					}

					const game = await Game.findById(id)
						.populate("creator")
						.populate("players")
						/* deeply populated, for every playerSubmission populate the userId field with a user */
						.populate({
							path: "playerSubmissions",
							populate: {
								path: "user"
							}
						})
						.exec();

					if (!game) {
						const data = JSON.stringify({
							event: GameEventEnum.NONEXISTENT_GAME,
							message: "game couldn't be found"
						});

						playGame.updateUser(req.user.username, data);
						return;
					}

					const data = JSON.stringify({
						event: GameEventEnum.OVERVIEW_GAME,
						game
					});

					playGame.updateAllUsers(data);
				}
				break;

			case GameEventEnum.SEND_MESSAGE:
				{
					const { chatMessage } = parsedMessage;

					if (!isChatMessage(chatMessage)) {
						const data = JSON.stringify({
							event: GameEventEnum.SEND_MESSAGE_FAILED,
							message: "Message failed to send (invalid format)"
						});

						playGame.updateUser(req.user.username, data);
						return;
					}

					const updatedChatMessage: ChatMessage = {
						...chatMessage,
						createdAt: new Date().toISOString()
					};

					const data = JSON.stringify({
						event: GameEventEnum.SEND_MESSAGE,
						chatMessage: updatedChatMessage
					});

					playGame.updateAllUsers(data);
				}
				break;

			case GameEventEnum.CHANGE_LANGUAGE:
				{
					const language = parsedMessage.language;

					if (!language) {
						return;
					}

					const data = JSON.stringify({
						event: GameEventEnum.CHANGE_LANGUAGE,
						language,
						username: req.user.username
					});

					playGame.updateAllUsers(data);
				}
				break;
		}
	});

	socket.on("close", (code, reason) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		console.log("closed", req.user.username);
	});

	socket.on("error", () => {
		console.log("error", req.user);

		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		playGame.remove(req.user.username);
	});
}
