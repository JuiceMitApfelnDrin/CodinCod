import websocket from "@fastify/websocket";
import { AuthenticatedInfo } from "types";

type Username = string;
type ConnectionId = string;

interface Connection {
  socket: websocket.WebSocket;
  connectionId: ConnectionId;
  userId: string;
  heartbeatInterval?: NodeJS.Timeout;
  lastPong: number;
  pongHandler: () => void; // Store for cleanup
}

interface ConnectionCallbacks {
  onConnectionLost?: (username: Username) => void;
  onConnectionRestored?: (username: Username) => void;
}

export class ConnectionManager {
  private connections = new Map<Username, Connection>();
  private readonly HEARTBEAT_INTERVAL = 30 * 1000;
  private readonly HEARTBEAT_TIMEOUT = 35 * 1000;
  private globalHeartbeatTimer?: NodeJS.Timeout;
  private callbacks: ConnectionCallbacks;

  constructor(callbacks: ConnectionCallbacks = {}) {
    this.callbacks = callbacks;
    this.startGlobalHeartbeat();
  }

  private startGlobalHeartbeat() {
    this.globalHeartbeatTimer = setInterval(() => {
      this.heartbeatAll();
    }, this.HEARTBEAT_INTERVAL);
  }

  private heartbeatAll() {
    const now = Date.now();
    const toRemove: Username[] = [];

    for (const [username, connection] of this.connections.entries()) {
      const timeSinceLastPong = now - connection.lastPong;

      if (timeSinceLastPong > this.HEARTBEAT_TIMEOUT) {
        console.warn(`Heartbeat timeout for ${username}`);
        toRemove.push(username);
        continue;
      }

      if (connection.socket.readyState === WebSocket.OPEN) {
        try {
          connection.socket.ping();
        } catch (error) {
          console.error(`Failed to ping ${username}:`, error);
          toRemove.push(username);
        }
      } else {
        toRemove.push(username);
      }
    }

    toRemove.forEach(username => {
      this.callbacks.onConnectionLost?.(username);
      this.remove(username);
    });

    if (toRemove.length > 0) {
      console.info(`Removed ${toRemove.length} dead connections`);
    }
  }

  add(user: AuthenticatedInfo, socket: websocket.WebSocket): ConnectionId {
    const connectionId = crypto.randomUUID();

    const existing = this.connections.get(user.username);
    if (existing) {
      socket.removeListener("pong", existing.pongHandler);
      if (existing.socket.readyState === WebSocket.OPEN) {
        existing.socket.close();
      }
    }

    const pongHandler = () => {
      const conn = this.connections.get(user.username);
      if (conn) {
        conn.lastPong = Date.now();
      }
    };

    socket.on("pong", pongHandler);

    const connection: Connection = {
      socket,
      connectionId,
      userId: user.userId,
      lastPong: Date.now(),
      pongHandler
    };

    this.connections.set(user.username, connection);
    console.info(`Connection established for ${user.username} (${connectionId})`);

    return connectionId;
  }

  remove(username: Username): void {
    const connection = this.connections.get(username);
    if (!connection) return;

    connection.socket.removeListener("pong", connection.pongHandler);

    if (connection.socket.readyState === WebSocket.OPEN) {
      try {
        connection.socket.close();
      } catch (error) {
        console.error(`Error closing socket for ${username}:`, error);
      }
    }

    this.connections.delete(username);
    console.info(`Connection removed for ${username}`);
  }

  get(username: Username): Connection | undefined {
    return this.connections.get(username);
  }

  send(username: Username, data: any): boolean {
    const connection = this.connections.get(username);
    if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${username}:`, error);
      this.remove(username);
      return false;
    }
  }

  broadcast(data: any, excludeUsers: Username[] = []): void {
    const message = JSON.stringify(data);
    this.connections.forEach((connection, username) => {
      if (excludeUsers.includes(username)) return;

      if (connection.socket.readyState === WebSocket.OPEN) {
        try {
          connection.socket.send(message);
        } catch (error) {
          console.error(`Failed to broadcast to ${username}:`, error);
          this.remove(username);
        }
      }
    });
  }

  isConnected(username: Username): boolean {
    const connection = this.connections.get(username);
    return connection?.socket.readyState === WebSocket.OPEN;
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getAllUsernames(): Username[] {
    return Array.from(this.connections.keys());
  }

  destroy(): void {
    if (this.globalHeartbeatTimer) {
      clearInterval(this.globalHeartbeatTimer);
    }

    for (const [_username, connection] of this.connections.entries()) {
      connection.socket.removeListener("pong", connection.pongHandler);
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.close(1001, "Server shutting down");
      }
    }

    this.connections.clear();
    console.info("ConnectionManager destroyed");
  }
}
