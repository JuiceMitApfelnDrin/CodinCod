import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onConnection } from "./on-connection.js";
import { ParamsId } from "@/routes/puzzle/[id]/types.js";
import { ChatMessage, gameEventEnum, isAuthenticatedInfo, isGameDto } from "types";
import { isValidObjectId } from "mongoose";
import { parseRawDataGameRequest } from "@/utils/functions/parse-raw-data-message.js";
import Game from "@/models/game/game.js";
import { UserWebSockets } from "./user-web-sockets.js";

const userWebSockets = new UserWebSockets();

export function gameSetup(
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
				event: gameEventEnum.NONEXISTENT_GAME,
				message: "invalid id"
			})
		);

		// TODO: give a good reason code
		socket.close();
		return;
	}
	onConnection(userWebSockets, req.user, id, socket);

	if (!isAuthenticatedInfo(req.user)) {
		return;
	}
	socket.on("message", async (message) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		let parsedMessage;

		try {
			parsedMessage = parseRawDataGameRequest(message);
		} catch (e) {
			const error = e as Error;

			return userWebSockets.updateUser(req.user.username, {
				event: gameEventEnum.ERROR,
				message: error.message
			});
		}

		const { event } = parsedMessage;

		switch (event) {
			case gameEventEnum.JOIN_GAME:
				{
					userWebSockets.add(req.user.username, socket);

					// TODO: something needs to happen here, for users who join late
				}
				break;
			case gameEventEnum.SUBMITTED_PLAYER:
				{
					const game = await Game.findById(id)
						.populate("owner")
						.populate("players")
						/* deeply populated, for every playerSubmission populate the userId field with a user */
						.populate({
							path: "playerSubmissions",
							populate: {
								path: "user"
							}
						})
						.exec();

					if (!isGameDto(game)) {
						return userWebSockets.updateUser(req.user.username, {
							event: gameEventEnum.NONEXISTENT_GAME,
							message: "game couldn't be found"
						});
					}

					userWebSockets.updateAllUsers({
						event: gameEventEnum.OVERVIEW_GAME,
						game
					});
				}
				break;

			case gameEventEnum.SEND_MESSAGE:
				{
					const updatedChatMessage: ChatMessage = {
						...parsedMessage.chatMessage,
						createdAt: new Date().toISOString()
					};

					userWebSockets.updateAllUsers({
						event: gameEventEnum.SEND_MESSAGE,
						chatMessage: updatedChatMessage
					});
				}
				break;

			case gameEventEnum.CHANGE_LANGUAGE:
				{
					const language = parsedMessage.language;

					if (!language) {
						return;
					}

					userWebSockets.updateAllUsers({
						event: gameEventEnum.CHANGE_LANGUAGE,
						language,
						username: req.user.username
					});
				}
				break;
			default:
				parsedMessage satisfies never;
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

		userWebSockets.remove(req.user.username);
	});
}
