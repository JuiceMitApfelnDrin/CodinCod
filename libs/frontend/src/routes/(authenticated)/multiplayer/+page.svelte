<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Error from "@/components/error/error.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import { authenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";
	import { buildFrontendUrl, frontendUrls, GameEventEnum, isCreator, webSocketUrls } from "types";

	let game:
		| {
				users: { username: string; userId: string; joinedAt: Date }[];
				creator: { username: string; userId: string; joinedAt: Date };
		  }
		| undefined;
	let games: { id: string; amountOfPlayersJoined: number }[];
	let gameId: string | undefined;
	let errorMessage: string | undefined;
	let hasRoomIdOnMount = false;

	const queryParamKeys = {
		ROOM_ID: "roomId"
	};

	function updateRoomIdInUrl() {
		if (gameId) {
			query.set(queryParamKeys.ROOM_ID, gameId);

			goto(`?${query.toString()}`);
		} else {
			query.delete(queryParamKeys.ROOM_ID);

			goto(`?${query.toString()}`);
		}
	}

	function checkForRoomId() {
		if (query.has(queryParamKeys.ROOM_ID)) {
			socket.send(
				JSON.stringify({
					event: GameEventEnum.JOIN_GAME,
					gameId: query.get(queryParamKeys.ROOM_ID),
					userId: $authenticatedUserInfo?.userId,
					username: $authenticatedUserInfo?.username
				})
			);

			hasRoomIdOnMount = true;
		}
	}

	let socket: WebSocket;
	onMount(() => {
		const webSocketUrl = buildWebSocketBackendUrl(webSocketUrls.WAITING_ROOM);
		socket = new WebSocket(webSocketUrl);

		socket.addEventListener("open", (message) => {
			console.info("WebSocket connection opened");

			checkForRoomId();
		});

		socket.addEventListener("message", async (message) => {
			const receivedInformation = JSON.parse(message.data);

			const { event } = receivedInformation;

			switch (event) {
				case GameEventEnum.HOST_GAME:
					{
						gameId = receivedInformation.message;

						updateRoomIdInUrl();
					}
					break;
				case GameEventEnum.OVERVIEW_OF_GAMES:
					{
						games = receivedInformation.data;
					}
					break;
				case GameEventEnum.OVERVIEW_GAME:
					{
						game = receivedInformation.data;
					}
					break;
				case GameEventEnum.GO_TO_GAME:
					{
						await goto(receivedInformation.message);
					}
					break;
				case GameEventEnum.NOT_ENOUGH_GAMES:
					{
						errorMessage = receivedInformation.message;
					}
					break;
				case GameEventEnum.NONEXISTENT_GAME:
					{
						const roomId = query.get(queryParamKeys.ROOM_ID);

						if (roomId) {
							await goto(buildFrontendUrl(frontendUrls.MULTIPLAYER_ID, { id: roomId }));
						}
					}
					break;
				default:
					console.warn("unknown / unhandled event: ", { event });

					break;
			}
		});
	});

	let query = new URLSearchParams($page.url.searchParams.toString());
</script>

{#if errorMessage}
	<Container>
		<Error
			link={{ href: frontendUrls.PUZZLE_CREATE, message: "Go to create a puzzle" }}
			message={errorMessage}
		/>
	</Container>
{:else}
	<Container>
		<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
			<H1>Multiplayer</H1>

			<div class="flex flex-col gap-2 md:flex-row md:gap-4">
				{#if gameId}
					<Button
						on:click={() => {
							socket.send(
								JSON.stringify({
									event: GameEventEnum.LEAVE_GAME,
									gameId: gameId,
									username: $authenticatedUserInfo?.username
								})
							);

							gameId = undefined;
							game = undefined;

							updateRoomIdInUrl();
						}}
					>
						leave game
					</Button>

					{#if $authenticatedUserInfo?.userId && isCreator(game?.creator.userId, $authenticatedUserInfo?.userId)}
						<Button
							on:click={() => {
								socket.send(
									JSON.stringify({
										event: GameEventEnum.START_GAME,
										gameId: gameId
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

		{#if gameId}
			<P>waiting for the game to start</P>

			{#if game}
				<ul>
					{#each game.users as user}
						<li class="list-inside list-disc">
							{user.username}{#if isCreator(game.creator.userId, user.userId)}
								{` - Creator/host!`}{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{:else if games && games.length > 0}
			<ul>
				{#each games as joinableGame}
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

								gameId = joinableGame.id;

								updateRoomIdInUrl();
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
