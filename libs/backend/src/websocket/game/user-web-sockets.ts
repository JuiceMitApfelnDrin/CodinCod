import { WebSocket } from "@fastify/websocket";
import { AuthenticatedInfo, GameResponse } from "types";
import { ConnectionManager } from "../connection-manager.js";

type Username = string;

export class UserWebSockets {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager({
      onConnectionLost: (username: string) => {
        console.info(`Game connection lost for user: ${username}`);
      }
    });
  }

  add(username: Username, socket: WebSocket, user: AuthenticatedInfo): void {
    this.connectionManager.add(user, socket);
  }

  remove(username: Username): void {
    this.connectionManager.remove(username);
  }

  updateAllUsers(response: GameResponse): void {
    const usernames = this.connectionManager.getAllUsernames();
    usernames.forEach((username: string) => {
      this.updateUser(username, response);
    });
  }

  updateUser(username: string, response: GameResponse): boolean {
    return this.connectionManager.send(username, response);
  }

  isConnected(username: Username): boolean {
    return this.connectionManager.isConnected(username);
  }

  getConnectionCount(): number {
    return this.connectionManager.getConnectionCount();
  }

  destroy(): void {
    this.connectionManager.destroy();
  }
}
