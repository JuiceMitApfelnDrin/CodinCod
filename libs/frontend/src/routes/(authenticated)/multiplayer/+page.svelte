<script lang="ts">
	import { goto } from "$app/navigation";
	import Error from "@/components/error/error.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import { authenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";
	import { frontendUrls, GameEventEnum, isCreator, webSocketUrls } from "types";

	let state: {
		errorMessage: string;
		gameId?: string;
		game?: {
			users: { username: string; userId: string; joinedAt: Date }[];
			creator: { username: string; userId: string; joinedAt: Date };
		};
		games: { id: string; amountOfPlayersJoined: number }[];
	} = {
		errorMessage: "",
		// TODO: time-left/countdown timer when game is started

		game: undefined,
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
			const receivedInformation = JSON.parse(message.data);

			const { event } = receivedInformation;

			console.log({ data: receivedInformation, event });

			switch (event) {
				case GameEventEnum.HOST_GAME:
					{
						state.gameId = receivedInformation.message;
					}
					break;
				case GameEventEnum.OVERVIEW_OF_GAMES:
					{
						state.games = receivedInformation.data;
					}
					break;
				case GameEventEnum.OVERVIEW_GAME:
					{
						state.game = receivedInformation.data;
					}
					break;
				case GameEventEnum.GO_TO_GAME:
					{
						await goto(receivedInformation.message);
					}
					break;
				case GameEventEnum.NOT_ENOUGH_GAMES:
					{
						state.errorMessage = receivedInformation.message;
					}
					break;
				default:
					console.log("unknown / unhandled event: ", { event });

					break;
			}
		});
	});
</script>

{#if state.errorMessage}
	<Container>
		<Error
			link={{ href: frontendUrls.PUZZLE_CREATE, message: "Go to create a puzzle" }}
			message={state.errorMessage}
		/>
	</Container>
{:else}
	<Container>
		<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
			<H1>Multiplayer</H1>

			<div class="flex flex-col gap-2 md:flex-row md:gap-4">
				{#if state.gameId}
					<Button
						on:click={() => {
							socket.send(
								JSON.stringify({
									event: GameEventEnum.LEAVE_GAME,
									gameId: state.gameId,
									username: $authenticatedUserInfo?.username
								})
							);

							state.gameId = undefined;
							state.game = undefined;
						}}
					>
						leave game
					</Button>

					{#if $authenticatedUserInfo?.userId && isCreator(state.game?.creator.userId, $authenticatedUserInfo?.userId)}
						<Button
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
						</Button>
					{/if}
				{:else}
					<Button
						on:click={() => {
							socket.send(
								JSON.stringify({
									event: GameEventEnum.HOST_GAME,
									userId: $authenticatedUserInfo?.userId,
									username: $authenticatedUserInfo?.username
								})
							);
						}}
					>
						host game
					</Button>
					<!-- TODO: give ability to host a custom game -->
				{/if}
			</div>
		</LogicalUnit>

		{#if state.gameId}
			<P>waiting for the game to start</P>

			{#if state.game}
				<ul>
					{#each state.game.users as user}
						<li class="list-inside list-disc">
							{user.username}{#if isCreator(state.game.creator.userId, user.userId)}
								{` - Creator/host!`}{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{:else if state.games && state.games.length > 0}
			<ul>
				{#each state.games as joinableGame}
					<li>
						<Button
							on:click={() => {
								socket.send(
									JSON.stringify({
										event: GameEventEnum.JOIN_GAME,
										gameId: joinableGame.id,
										userId: $authenticatedUserInfo?.userId,
										username: $authenticatedUserInfo?.username
									})
								);

								state.gameId = joinableGame.id;
							}}
						>
							Join a game with {joinableGame.amountOfPlayersJoined} other players!
						</Button>
					</li>
				{/each}
			</ul>
		{:else}
			<P>
				No games are being hosted by other players. You can host on yourself by clicking on the
				"host game" button.
			</P>
		{/if}
	</Container>
{/if}
