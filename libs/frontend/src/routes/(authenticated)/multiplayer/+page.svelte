<script lang="ts">
	import { authenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";
	import { GameEventEnum } from "types";

	let state = {
		// players
		// TODO: timeleft/countdown timer when game is started
		// gameId
		// currently joinable games
		// host of game : boolean
		creator: false,
		gameId: undefined,
		games: [
			// {
			// amountOfPlayersJoined: number
			// gameId: string
			// }
		]
	};

	let socket: WebSocket;
	onMount(() => {
		// TODO: remove hardcoded url, make env param?
		socket = new WebSocket("ws://localhost:8888/");

		socket.addEventListener("open", (message) => {
			// TODO: receive open games from backend on connection
			console.log("WebSocket connection opened");
			console.log(message);
		});

		socket.addEventListener("message", (message) => {
			// ongoing, arrange player data, gameId, hostGame
			const data = JSON.parse(message.data);
			console.log({ data });

			const { event } = data;
			switch (event) {
				case GameEventEnum.HOST_GAME:
					{
						state.gameId = data.message;
					}
					break;
				case "welcome":
					{
						state.games = data.games;
					}
					break;
				default:
					break;
			}
		});
	});
</script>

{#if state.gameId}
	<button
		on:click={() => {
			console.log({ state });
			socket.send(
				JSON.stringify({
					event: GameEventEnum.LEAVE_GAME,
					gameId: state.gameId,
					username: $authenticatedUserInfo?.username
				})
			);

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
		}}
	>
		host game
	</button>

	{#if state.games}
		<ul>
			{#each state.games as joinableGame}
				<!-- TODO: on click, set state.gameid -->
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

							state.gameId = joinableGame.id;
						}}
					>
						join game with id: {joinableGame.id} and players {joinableGame.amountOfPlayersJoined}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<!-- 

-->

<!--  -->
