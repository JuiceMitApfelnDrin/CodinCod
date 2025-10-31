import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import {
	DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
	frontendUrls,
	GameEntity,
	gameModeEnum,
	gameVisibilityEnum,
	isAuthenticatedInfo,
	waitingRoomEventEnum
} from "types";
import { WaitingRoom } from "./waiting-room.js";
import { onConnection as onWaitingRoomConnection } from "./on-connection.js";
import { parseRawDataWaitingRoomRequest } from "@/utils/functions/parse-raw-data-message.js";
import { puzzleService } from "@/services/puzzle.service.js";
import { gameService } from "@/services/game.service.js";

const waitingRoom = new WaitingRoom();

export function waitingRoomSetup(
	socket: WebSocket,
	req: FastifyRequest,
	fastify: FastifyInstance
) {
	if (!isAuthenticatedInfo(req.user)) {
		socket.close(1008, "Authentication required");
		return;
	}

	onWaitingRoomConnection(waitingRoom, socket, req.user);

	// Handle ping from client
	socket.on("ping", () => {
		socket.pong();
	});

	socket.on("message", async (message) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		let parsedMessage;

		try {
			parsedMessage = parseRawDataWaitingRoomRequest(message);
		} catch (e) {
			const error = e as Error;
			waitingRoom.updateUser(req.user.username, {
				event: waitingRoomEventEnum.ERROR,
				message: error.message
			});
			return;
		}

		const { event } = parsedMessage;

		switch (event) {
			case waitingRoomEventEnum.HOST_ROOM: {
				const roomId = waitingRoom.hostRoom(req.user, parsedMessage.options);
				fastify.log.info(
					{ username: req.user.username, roomId },
					"User hosted room"
				);
				break;
			}

			case waitingRoomEventEnum.JOIN_ROOM: {
				const success = waitingRoom.joinRoom(req.user, parsedMessage.roomId);
				if (!success) {
					waitingRoom.updateUser(req.user.username, {
						event: waitingRoomEventEnum.ERROR,
						message: `Room ${parsedMessage.roomId} not found`
					});
				}
				break;
			}

			case waitingRoomEventEnum.JOIN_BY_INVITE_CODE: {
				const roomId = waitingRoom.getRoomByInviteCode(
					parsedMessage.inviteCode
				);
				if (!roomId) {
					waitingRoom.updateUser(req.user.username, {
						event: waitingRoomEventEnum.ERROR,
						message: `Invalid invite code: ${parsedMessage.inviteCode}`
					});
					break;
				}

				const success = waitingRoom.joinRoom(req.user, roomId);
				if (!success) {
					waitingRoom.updateUser(req.user.username, {
						event: waitingRoomEventEnum.ERROR,
						message: "Failed to join room"
					});
				}
				break;
			}

			case waitingRoomEventEnum.LEAVE_ROOM: {
				waitingRoom.leaveRoom(req.user.username, parsedMessage.roomId);
				break;
			}

			case waitingRoomEventEnum.CHAT_MESSAGE: {
				const room = waitingRoom.getRoom(parsedMessage.roomId);

				if (!room) {
					waitingRoom.updateUser(req.user.username, {
						event: waitingRoomEventEnum.ERROR,
						message: `Room ${parsedMessage.roomId} not found`
					});
					break;
				}

				const userInRoom = req.user.username in room;

				if (!userInRoom) {
					waitingRoom.updateUser(req.user.username, {
						event: waitingRoomEventEnum.ERROR,
						message: "You must be in the room to send messages"
					});
					break;
				}

				waitingRoom.updateUsersInRoom(parsedMessage.roomId, {
					event: waitingRoomEventEnum.CHAT_MESSAGE,
					username: req.user.username,
					message: parsedMessage.message,
					createdAt: new Date()
				});
				break;
			}

			case waitingRoomEventEnum.START_GAME: {
				try {
					const randomPuzzles = await puzzleService.findRandomApproved(1);

					if (randomPuzzles.length < 1) {
						waitingRoom.updateUser(req.user.username, {
							event: waitingRoomEventEnum.NOT_ENOUGH_PUZZLES,
							message: "Create a puzzle and get it approved to play multiplayer"
						});
						return;
					}

					const randomPuzzle = randomPuzzles[0];
					const room = waitingRoom.getRoom(parsedMessage.roomId);

					if (!room) {
						waitingRoom.updateUser(req.user.username, {
							event: waitingRoomEventEnum.ERROR,
							message: `Room ${parsedMessage.roomId} not found`
						});
						return;
					}

					const players = Object.values(room).map((player) => player.userId);

					if (players.length <= 0) {
						waitingRoom.removeEmptyRooms();
						waitingRoom.updateUser(req.user.username, {
							event: waitingRoomEventEnum.ERROR,
							message: "No players in room"
						});
						return;
					}

					const now = new Date();
					const roomOptions = waitingRoom.getRoomOptions(parsedMessage.roomId);
					const gameDuration =
						roomOptions?.maxGameDurationInSeconds ??
						DEFAULT_GAME_LENGTH_IN_MILLISECONDS / 1000;
					const gameDurationMs = gameDuration * 1000;

					const countdownSeconds = 15;
					const startTime = new Date(now.getTime() + countdownSeconds * 1000);
					const endTime = new Date(startTime.getTime() + gameDurationMs);

					const createGameEntity: GameEntity = {
						players,
						owner: waitingRoom.findRoomOwner(room).userId,
						puzzle: (randomPuzzle._id as any).toString(),
						createdAt: now,
						startTime,
						endTime,
						options: {
							allowedLanguages: [],
							maxGameDurationInSeconds: gameDuration,
							mode: gameModeEnum.FASTEST,
							visibility: gameVisibilityEnum.PUBLIC,
							rated: true,
							...roomOptions
						},
						playerSubmissions: []
					};
					const newlyCreatedGame = await gameService.create(createGameEntity);
					const gameUrl = frontendUrls.multiplayerById(newlyCreatedGame.id);

					// Store the pending game start state in the room
					waitingRoom.setPendingGameStart(
						parsedMessage.roomId,
						gameUrl,
						startTime
					);

					waitingRoom.updateUsersInRoom(parsedMessage.roomId, {
						event: waitingRoomEventEnum.START_GAME,
						gameUrl,
						startTime
					});

					fastify.log.info(
						{
							gameId: newlyCreatedGame.id,
							playerCount: players.length,
							startTime,
							countdownSeconds
						},
						"Game created with countdown"
					);
					return;
				} catch (error) {
					fastify.log.error({ err: error }, "Error starting game");
					waitingRoom.updateUser(req.user.username, {
						event: waitingRoomEventEnum.ERROR,
						message: "Failed to start game"
					});
				}
				break;
			}

			default:
				event satisfies never;
				break;
		}

		const joinableRooms = waitingRoom.getRooms();
		waitingRoom.updateAllUsers({
			event: waitingRoomEventEnum.OVERVIEW_OF_ROOMS,
			rooms: joinableRooms
		});
	});

	socket.on("close", (code, reason) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}
		fastify.log.info(
			{ username: req.user.username, code, reason: reason.toString() },
			"Waiting room socket closed"
		);
		waitingRoom.removeUserFromUsers(req.user.username);
		waitingRoom.removeEmptyRooms();
	});

	socket.on("error", (error) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}
		fastify.log.error(
			{ err: error },
			`Waiting room socket error for ${req.user.username}`
		);
		waitingRoom.removeUserFromUsers(req.user.username);
		waitingRoom.removeEmptyRooms();
	});
}
