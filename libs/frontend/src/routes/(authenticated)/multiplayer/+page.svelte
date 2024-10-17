<script lang="ts">
	import { goto } from "$app/navigation";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import { authenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";
	import { GameEventEnum, webSocketUrls } from "types";

	let state: {
		creator?: boolean;
		gameId?: string;
		game?: { users: { username: string; userId: string }[] };
		games: { id: string; amountOfPlayersJoined: number }[];
	} = {
		// TODO: timeleft/countdown timer when game is started
		creator: false,
		gameId: undefined,
		games: [
			// {
			// players
			// amountOfPlayersJoined: number
			// }
		]
	};

	let socket: WebSocket;
	onMount(() => {
		const webSocketUrl = buildWebSocketBackendUrl(webSocketUrls.WAITING_ROOM);
		socket = new WebSocket(webSocketUrl);

		socket.addEventListener("open", (message) => {
			console.log("WebSocket connection opened");
		});

		socket.addEventListener("message", async (message) => {
			const data = JSON.parse(message.data);

			const { event } = data;

			console.log({ event, data });

			switch (event) {
				case GameEventEnum.HOST_GAME:
					{
						state.gameId = data.message;
					}
					break;
				case GameEventEnum.OVERVIEW_OF_GAMES:
					{
						state.games = JSON.parse(data.message);
					}
					break;
				case GameEventEnum.OVERVIEW_GAME:
					{
						state.game = { users: JSON.parse(data.message) };
					}
					break;
				case GameEventEnum.GO_TO_GAME:
					{
						await goto(data.message);
					}
					break;
				default:
					console.log("unknown / unhandled event: ", { event });

					break;
			}
		});
	});
</script>

{#if state.gameId}
	<button
		on:click={() => {
			socket.send(
				JSON.stringify({
					event: GameEventEnum.LEAVE_GAME,
					gameId: state.gameId,
					username: $authenticatedUserInfo?.username
				})
			);

			state.creator = false;
			state.gameId = undefined;
		}}
	>
		leave game
	</button>

	{#if state.creator}
		<button
			on:click={() => {
				socket.send(
					JSON.stringify({
						event: GameEventEnum.START_GAME,
						gameId: state.gameId
					})
				);
			}}
		>
			start game
		</button>
	{/if}

	<div>waiting game</div>
{:else}
	<button
		on:click={() => {
			socket.send(
				JSON.stringify({
					event: GameEventEnum.HOST_GAME,
					username: $authenticatedUserInfo?.username,
					userId: $authenticatedUserInfo?.userId
				})
			);
			state.creator = true;
		}}
	>
		host game
	</button>

	{#if state.games}
		<ul>
			{#each state.games as joinableGame}
				<li>
					<button
						on:click={() => {
							socket.send(
								JSON.stringify({
									event: GameEventEnum.JOIN_GAME,
									gameId: joinableGame.id,
									username: $authenticatedUserInfo?.username,
									userId: $authenticatedUserInfo?.userId
								})
							);

							state.creator = false;
							state.gameId = joinableGame.id;
						}}
					>
						Join a game with {joinableGame.amountOfPlayersJoined} other players!
					</button>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
