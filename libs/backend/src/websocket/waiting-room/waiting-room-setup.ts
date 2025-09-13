import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { redisWaitingRoomSetup } from "../redis-waiting-room-setup.js";

export async function waitingRoomSetup(
	socket: WebSocket,
	req: FastifyRequest
): Promise<void> {
	return redisWaitingRoomSetup(socket, req);
}
