import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import { onConnection } from "./on-connection.js";
import {
	ChatMessage,
	gameEventEnum,
	getUserIdFromUser,
	isAuthenticatedInfo,
	isGameDto,
	isPuzzleDto,
	ObjectId
} from "types";
import { isValidObjectId } from "mongoose";
import { parseRawDataGameRequest } from "@/utils/functions/parse-raw-data-message.js";
import Game, { GameDocument } from "@/models/game/game.js";
import { UserWebSockets } from "./user-web-sockets.js";
import { ParamsId } from "@/types/types.js";
import Puzzle from "@/models/puzzle/puzzle.js";

const userWebSockets = new UserWebSockets();

function isPlayerInGame(game: GameDocument, userId: ObjectId): boolean {
	return game.players.some((player) => getUserIdFromUser(player) === userId);
}

function sendErrorAndClose(socket: WebSocket, message: string): void {
	socket.send(
		JSON.stringify({
			event: gameEventEnum.ERROR,
			message
		})
	);
	socket.close(1008, message);
}

export function gameSetup(
	socket: WebSocket,
	req: FastifyRequest<ParamsId>,
	fastify: FastifyInstance
) {
	const { id } = req.params;

	if (!isAuthenticatedInfo(req.user)) {
		sendErrorAndClose(socket, "Authentication required");
		return;
	}

	if (!isValidObjectId(id)) {
		sendErrorAndClose(socket, "Invalid game ID");
		return;
	}

	onConnection(userWebSockets, req.user, id, socket);

	socket.on("message", async (message) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		let parsedMessage;

		try {
			parsedMessage = parseRawDataGameRequest(message);
		} catch (e) {
			const error = e as Error;
			userWebSockets.updateUser(req.user.username, {
				event: gameEventEnum.ERROR,
				message: error.message
			});
			return;
		}

		const { event } = parsedMessage;

		switch (event) {
			case gameEventEnum.JOIN_GAME: {
				try {
					const gameToUpdate = await Game.findById(id);

					if (!isGameDto(gameToUpdate)) {
						userWebSockets.updateUser(req.user.username, {
							event: gameEventEnum.NONEXISTENT_GAME,
							message: "Game not found"
						});
						return;
					}

					if (!isPlayerInGame(gameToUpdate, req.user.userId)) {
						gameToUpdate.players.push(req.user.userId);
						await gameToUpdate.save();
					}

					const game = await Game.findById(id)
						.populate("owner")
						.populate("players")
						.populate({
							path: "playerSubmissions",
							populate: { path: "user" }
						})
						.exec();

					if (!isGameDto(game)) {
						userWebSockets.updateUser(req.user.username, {
							event: gameEventEnum.NONEXISTENT_GAME,
							message: "Game not found"
						});
						return;
					}

					const puzzle = await Puzzle.findById(game.puzzle).populate("author");

					if (!isPuzzleDto(puzzle)) {
						userWebSockets.updateUser(req.user.username, {
							event: gameEventEnum.ERROR,
							message: "Puzzle not found"
						});
						return;
					}

					userWebSockets.updateAllUsers({
						event: gameEventEnum.OVERVIEW_GAME,
						game,
						puzzle
					});
				} catch (error) {
					fastify.log.error("Error in JOIN_GAME:", error);
					userWebSockets.updateUser(req.user.username, {
						event: gameEventEnum.ERROR,
						message: "Failed to join game"
					});
				}
				break;
			}

			case gameEventEnum.SUBMITTED_PLAYER: {
				try {
					const game = await Game.findById(id)
						.populate("owner")
						.populate("players")
						.populate({
							path: "playerSubmissions",
							populate: { path: "user" }
						})
						.exec();

					if (!isGameDto(game)) {
						userWebSockets.updateUser(req.user.username, {
							event: gameEventEnum.NONEXISTENT_GAME,
							message: "Game not found"
						});
						return;
					}

					userWebSockets.updateAllUsers({
						event: gameEventEnum.OVERVIEW_GAME,
						game
					});
				} catch (error) {
					fastify.log.error("Error in SUBMITTED_PLAYER:", error);
					userWebSockets.updateUser(req.user.username, {
						event: gameEventEnum.ERROR,
						message: "Failed to update submission"
					});
				}
				break;
			}

			case gameEventEnum.SEND_MESSAGE: {
				const updatedChatMessage: ChatMessage = {
					...parsedMessage.chatMessage,
					createdAt: new Date().toISOString()
				};

				userWebSockets.updateAllUsers({
					event: gameEventEnum.SEND_MESSAGE,
					chatMessage: updatedChatMessage
				});
				break;
			}

			case gameEventEnum.CHANGE_LANGUAGE: {
				const language = parsedMessage.language;

				if (!language) {
					return;
				}

				userWebSockets.updateAllUsers({
					event: gameEventEnum.CHANGE_LANGUAGE,
					language,
					username: req.user.username
				});
				break;
			}

			default:
				parsedMessage satisfies never;
				break;
		}
	});

	socket.on("close", (code, reason) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}
		console.info(
			`Game socket closed for ${req.user.username}: ${code} - ${reason}`
		);
		userWebSockets.remove(req.user.username);
	});

	socket.on("error", (error) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}
		fastify.log.error(`Game socket error for ${req.user.username}:`, error);
		userWebSockets.remove(req.user.username);
	});
}
