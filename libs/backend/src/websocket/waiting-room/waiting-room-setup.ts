import { WebSocket } from "@fastify/websocket";
import { FastifyInstance, FastifyRequest } from "fastify";
import {
	buildFrontendUrl,
	frontendUrls,
	isAuthenticatedInfo,
	PuzzleVisibilityEnum,
	waitingRoomEventEnum
} from "types";
import { WaitingRoom } from "./waiting-room.js";
import { onConnection } from "./on-connection.js";
import { parseRawDataMessage } from "@/utils/functions/parse-raw-data-message.js";
import Puzzle, { PuzzleDocument } from "@/models/puzzle/puzzle.js";
import Game from "@/models/game/game.js";

const waitingRoom = new WaitingRoom();

export function waitingRoomSetup(socket: WebSocket, req: FastifyRequest, fastify: FastifyInstance) {
	if (!isAuthenticatedInfo(req.user)) {
		return;
	}
	onConnection(waitingRoom, socket, req.user);

	socket.on("message", async (message) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}

		let parsedMessage = parseRawDataMessage(message, socket);

		if (!parsedMessage) {
			return;
		}

		const { event, roomId } = parsedMessage;

		switch (event) {
			case waitingRoomEventEnum.HOST_ROOM: {
				waitingRoom.hostRoom(req.user);
				break;
			}
			case waitingRoomEventEnum.JOIN_ROOM: {
				waitingRoom.joinRoom(req.user, roomId);
				break;
			}
			case waitingRoomEventEnum.LEAVE_ROOM: {
				waitingRoom.leaveRoom(req.user.username, roomId);
				waitingRoom.addUserToUsers(req.user.username, socket);
				break;
			}
			case waitingRoomEventEnum.START_GAME: {
				const randomPuzzles = await Puzzle.aggregate<PuzzleDocument>([
					{ $match: { visibility: PuzzleVisibilityEnum.APPROVED } },
					{ $sample: { size: 1 } }
				]).exec();

				if (randomPuzzles.length < 1) {
					const data = JSON.stringify({
						event: waitingRoomEventEnum.NOT_ENOUGH_PUZZLES,
						socket,
						message: "Create a puzzle and get it approved in order to play multiplayer games"
					});

					waitingRoom.updateUser(req.user.username, data);
					return;
				}

				const randomPuzzle = randomPuzzles[0];

				const room = waitingRoom.getRoom(roomId);

				if (!room) {
					const data = JSON.stringify({
						event: waitingRoomEventEnum.NONEXISTENT_ROOM,
						socket,
						message: `Couldn't find room with id (${roomId})`
					});

					waitingRoom.updateUser(req.user.username, data);
					return;
				}

				const players = Object.values(room).map((player) => player.userId);

				if (players.length <= 0) {
					const data = JSON.stringify({
						event: waitingRoomEventEnum.INCORRECT_VALUE,
						socket,
						message: `Couldn't find anyone in room with id (${roomId})`
					});

					waitingRoom.removeEmptyRooms();

					waitingRoom.updateUser(req.user.username, data);
					return;
				}

				const databaseGame = new Game({
					players: players,
					creator: players[0],
					puzzle: randomPuzzle._id
				});

				const newlyCreatedGame = await databaseGame.save();

				const usernamesOfUsersInRoom = Object.keys(room);

				usernamesOfUsersInRoom.forEach((username) => {
					waitingRoom.updateUser(
						username,
						JSON.stringify({
							event: waitingRoomEventEnum.GO_TO_GAME,
							message: buildFrontendUrl(frontendUrls.MULTIPLAYER_ID, { id: newlyCreatedGame.id })
						})
					);
					waitingRoom.removeUserFromUsers(username);
				});
				break;
			}
			default:
				const data = JSON.stringify({
					event: waitingRoomEventEnum.INCORRECT_VALUE,
					message: `unknown event ${event}, add a way to handle this event first`
				});

				waitingRoom.updateUser(req.user.username, data);
				break;
		}

		const joinableRooms = waitingRoom.getRooms();
		const data = JSON.stringify({
			event: waitingRoomEventEnum.OVERVIEW_OF_ROOMS,
			rooms: joinableRooms
		});
		waitingRoom.updateAllUsers(data);
	});

	socket.on("close", (code, reason) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}
		// waitingRoom.removeUserFromUsers(req.user.username);
		// waitingRoom.removeEmptyRooms();
	});

	socket.on("error", (e) => {
		if (!isAuthenticatedInfo(req.user)) {
			return;
		}
		fastify.log.info(`error occurred for user ${req.user.username}: ${e}`);

		waitingRoom.removeUserFromUsers(req.user.username);
		waitingRoom.removeEmptyRooms();
	});
}
