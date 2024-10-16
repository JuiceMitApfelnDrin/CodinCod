import { GameUserInfo } from "types";

export type Username = string;
export type GameId = string;
export type OpenGame = { [key: Username]: GameUserInfo };
export type OpenGames = { [key: GameId]: OpenGame };
