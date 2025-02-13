<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import DisplayError from "@/components/error/display-error.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import { authenticatedUserInfo } from "@/stores";
	import { frontendUrls, isAuthor, waitingRoomEventEnum, webSocketUrls } from "types";

	let room:
		| {
				users: { username: string; userId: string; joinedAt: Date }[];
				creator: { username: string; userId: string; joinedAt: Date };
				roomId: string;
		  }
		| undefined;
	let rooms: { roomId: string; amountOfPlayersJoined: number }[];
	let errorMessage: string | undefined;

	const queryParamKeys = {
		ROOM_ID: "roomId"
	};

	function updateRoomIdInUrl() {
		if (room?.roomId) {
			query.set(queryParamKeys.ROOM_ID, room.roomId);

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
					event: waitingRoomEventEnum.JOIN_ROOM,
					roomId: query.get(queryParamKeys.ROOM_ID),
					userId: $authenticatedUserInfo?.userId,
					username: $authenticatedUserInfo?.username
				})
			);

			updateRoomIdInUrl();
		}
	}

	function connectWithWebsocket() {
		if (socket) {
			socket.close();
		}

		const webSocketUrl = buildWebSocketBackendUrl(webSocketUrls.WAITING_ROOM);
		socket = new WebSocket(webSocketUrl);

		socket.onopen = (message) => {
			console.info("WebSocket connection opened");

			checkForRoomId();
		};

		socket.onerror = (e) => {
			console.error("Closing websocket", e);
		};

		socket.onclose = (message) => {
			console.info("WebSocket connection closed:", message.code, message.reason);

			setTimeout(function () {
				connectWithWebsocket();
			}, 1000);
		};

		socket.onmessage = (message) => {
			const receivedInformation = JSON.parse(message.data);

			const { event } = receivedInformation;

			switch (event) {
				case waitingRoomEventEnum.OVERVIEW_OF_ROOMS:
					{
						rooms = receivedInformation.rooms;
					}
					break;
				case waitingRoomEventEnum.OVERVIEW_ROOM:
					{
						room = receivedInformation.room;
					}
					break;
				case waitingRoomEventEnum.GO_TO_GAME:
					{
						goto(receivedInformation.message);
					}
					break;
				case waitingRoomEventEnum.NOT_ENOUGH_PUZZLES:
					{
						errorMessage = receivedInformation.message;
					}
					break;
				case waitingRoomEventEnum.NONEXISTENT_ROOM:
					{
					}
					break;
				default:
					console.warn("unknown / unhandled event: ", { event });

					break;
			}
		};
	}

	let socket: WebSocket;
	if (browser) {
		connectWithWebsocket();
	}

	$: if (room?.roomId) updateRoomIdInUrl();

	let query = new URLSearchParams($page.url.searchParams.toString());
</script>

{#if errorMessage}
	<Container>
		<DisplayError
			link={{ href: frontendUrls.PUZZLE_CREATE, text: "Go to create a puzzle" }}
			message={errorMessage}
		/>
	</Container>
{:else}
	<Container>
		<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
			<H1>Multiplayer</H1>

			<div class="flex flex-col gap-2 md:flex-row md:gap-4">
				{#if room?.roomId}
					<Button
						on:click={() => {
							if (room?.roomId) {
								socket.send(
									JSON.stringify({
										event: waitingRoomEventEnum.LEAVE_ROOM,
										roomId: room.roomId,
										username: $authenticatedUserInfo?.username
									})
								);

								room = undefined;
							}
						}}
					>
						Leave room
					</Button>

					{#if $authenticatedUserInfo?.userId && isAuthor(room?.creator.userId, $authenticatedUserInfo?.userId)}
						<Button
							on:click={() => {
								if (room?.roomId) {
									socket.send(
										JSON.stringify({
											event: waitingRoomEventEnum.START_GAME,
											roomId: room.roomId
										})
									);
								}
							}}
						>
							Start room
						</Button>
					{/if}
				{:else}
					<Button
						on:click={() => {
							socket.send(
								JSON.stringify({
									event: waitingRoomEventEnum.HOST_ROOM,
									userId: $authenticatedUserInfo?.userId,
									username: $authenticatedUserInfo?.username
								})
							);
						}}
					>
						Host room
					</Button>
					<!-- TODO: give ability to host a custom room -->
				{/if}
			</div>
		</LogicalUnit>

		{#if room}
			<P>waiting for the room to start</P>

			<ul>
				{#each room.users as user}
					<li class="list-inside list-disc">
						{user.username}{#if isAuthor(room.creator.userId, user.userId)}
							{` - Creator/host!`}{/if}
					</li>
				{/each}
			</ul>
		{:else if rooms && rooms.length > 0}
			<ul>
				{#each rooms as joinableRoom}
					<li>
						<Button
							on:click={() => {
								socket.send(
									JSON.stringify({
										event: waitingRoomEventEnum.JOIN_ROOM,
										roomId: joinableRoom.roomId,
										userId: $authenticatedUserInfo?.userId,
										username: $authenticatedUserInfo?.username
									})
								);
							}}
						>
							Join a room with {joinableRoom.amountOfPlayersJoined} other players!
						</Button>
					</li>
				{/each}
			</ul>
		{:else}
			<P>
				No rooms are being hosted by other players. You can host one yourself by clicking on the
				"host room" button.
			</P>
		{/if}
	</Container>
{/if}
