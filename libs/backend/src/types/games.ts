import { GameEventUserInfo } from "types";

export type WebSocketGame = Map<string, GameEventUserInfo>;
export type WebSocketGamesMap = Map<string, WebSocketGame>;
