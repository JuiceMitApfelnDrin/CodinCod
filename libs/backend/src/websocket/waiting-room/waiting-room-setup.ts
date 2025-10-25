import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import {
	DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
	frontendUrls,
	GameEntity,
	GameModeEnum,
	GameVisibilityEnum,
	isAuthenticatedInfo,
	puzzleVisibilityEnum,
	waitingRoomEventEnum
} from "types";
import { WaitingRoom } from "./waiting-room.js";
import { onConnection as onWaitingRoomConnection } from "./on-connection.js";
import { parseRawDataWaitingRoomRequest } from "@/utils/functions/parse-raw-data-message.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import Game from "@/models/game/game.js";

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
				const roomId = waitingRoom.hostRoom(req.user);
				console.info(`${req.user.username} hosted room ${roomId}`);
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

			case waitingRoomEventEnum.LEAVE_ROOM: {
				waitingRoom.leaveRoom(req.user.username, parsedMessage.roomId);
				break;
			}

			case waitingRoomEventEnum.START_GAME: {
				try {
					console.log(
						`START_GAME requested by ${req.user.username} for room ${parsedMessage.roomId}`
					);

					const randomPuzzles = await Puzzle.aggregate([
						{ $match: { visibility: puzzleVisibilityEnum.APPROVED } },
						{ $sample: { size: 1 } }
					]).exec();

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
						console.error(
							`Room ${parsedMessage.roomId} not found. Available rooms:`,
							waitingRoom.getAllRoomIds()
						);
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
					const createGameEntity: GameEntity = {
						players,
						owner: waitingRoom.findRoomOwner(room).userId,
						puzzle: randomPuzzle._id.toString(),
						createdAt: now,
						startTime: now,
						endTime: new Date(
							now.getTime() + DEFAULT_GAME_LENGTH_IN_MILLISECONDS
						),
						options: {
							allowedLanguages: [],
							maxGameDurationInSeconds: DEFAULT_GAME_LENGTH_IN_MILLISECONDS,
							mode: GameModeEnum.RATED,
							visibility: GameVisibilityEnum.PUBLIC
						},
						playerSubmissions: []
					};

					const databaseGame = new Game(createGameEntity);
					const newlyCreatedGame = await databaseGame.save();

					const usernamesInRoom = Object.keys(room);
					usernamesInRoom.forEach((username) => {
						waitingRoom.updateUser(username, {
							event: waitingRoomEventEnum.START_GAME,
							gameUrl: frontendUrls.multiplayerById(newlyCreatedGame.id)
						});
					});

					// Give the clients time to receive the START_GAME message before closing connections
					setTimeout(() => {
						usernamesInRoom.forEach((username) => {
							waitingRoom.removeUserFromUsers(username);
						});
					}, 100);

					console.info(
						`Game ${newlyCreatedGame.id} started with ${players.length} players`
					);
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
		console.info(
			`Waiting room socket closed for ${req.user.username}: ${code} - ${reason}`
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
