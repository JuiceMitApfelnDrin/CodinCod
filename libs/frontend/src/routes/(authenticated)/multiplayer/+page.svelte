<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import DisplayError from "@/components/error/display-error.svelte";
	import ConnectionStatus from "@/components/websocket/connection-status.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { buildWebSocketUrl } from "@/config/websocket";
	import { authenticatedUserInfo } from "@/stores";
	import { WebSocketManager } from "@/websocket/websocket-manager.svelte";
	import {
		WEBSOCKET_STATES,
		type WebSocketState
	} from "@/websocket/websocket-constants";
	import {
		frontendUrls,
		isAuthor,
		isWaitingRoomResponse,
		waitingRoomEventEnum,
		webSocketUrls,
		type RoomOverviewResponse,
		type RoomStateResponse,
		type WaitingRoomRequest,
		type WaitingRoomResponse
	} from "types";
	import { testIds } from "@/config/test-ids";

	let room: RoomStateResponse | undefined = $state();
	let rooms: RoomOverviewResponse[] = $state([]);
	let errorMessage: string | undefined = $state();
	let connectionState = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);

	const queryParamKeys = {
		ROOM_ID: "roomId"
	};

	function updateRoomIdInUrl() {
		if (room?.roomId) {
			query.set(queryParamKeys.ROOM_ID, room.roomId);

			goto(`?${query.toString()}`, { replaceState: true });
		} else {
			query.delete(queryParamKeys.ROOM_ID);

			goto(`?${query.toString()}`, { replaceState: true });
		}
	}

	function checkForRoomId() {
		const roomId = query.get(queryParamKeys.ROOM_ID);

		if (!roomId) {
			return;
		}

		wsManager.send({
			event: waitingRoomEventEnum.JOIN_ROOM,
			roomId
		});
	}

	function handleWaitingRoomMessage(data: WaitingRoomResponse) {
		const { event } = data;

		switch (event) {
			case waitingRoomEventEnum.OVERVIEW_OF_ROOMS:
				{
					rooms = data.rooms;
				}
				break;
			case waitingRoomEventEnum.OVERVIEW_ROOM:
				{
					room = data.room;
				}
				break;
			case waitingRoomEventEnum.START_GAME:
				{
					goto(data.gameUrl);
				}
				break;
			case waitingRoomEventEnum.NOT_ENOUGH_PUZZLES:
				{
					errorMessage = data.message;
				}
				break;
			case waitingRoomEventEnum.ERROR:
				{
					console.error(data.message);

					// If we got an error about room not found, clear the URL param
					if (
						data.message.includes("Room") &&
						data.message.includes("not found")
					) {
						query.delete(queryParamKeys.ROOM_ID);
						goto(`?${query.toString()}`, { replaceState: true });
					}
				}
				break;
			default: {
				// Exhaustiveness check - all cases should be handled above
				const _exhaustive: never = data as never;
				console.error("Unhandled event type:", _exhaustive);
				break;
			}
		}
	}
	const wsManager = new WebSocketManager<
		WaitingRoomRequest,
		WaitingRoomResponse
	>({
		url: buildWebSocketUrl(webSocketUrls.WAITING_ROOM),
		onMessage: handleWaitingRoomMessage,
		onStateChange: (state) => {
			connectionState = state;
			if (state === "connected") {
				checkForRoomId();
			} else if (state === "disconnected") {
				// Only clear room state, keep URL param for sharing/rejoining
				room = undefined;
			}
		},
		validateResponse: isWaitingRoomResponse
	});

	if (browser) {
		wsManager.connect();
	}

	$effect(() => {
		if (room?.roomId) updateRoomIdInUrl();
	});

	$effect(() => {
		return () => {
			wsManager.destroy();
		};
	});

	let query = new URLSearchParams($page.url.searchParams.toString());

	function sendWaitingRoomMessage(data: WaitingRoomRequest) {
		wsManager.send(data);
	}
</script>

<svelte:head>
	<title>Multiplayer waiting room | CodinCod</title>
	<meta
		name="description"
		content="Sharpen your skills in live coding duels! Get instant feedback from opponents and learn faster through collaborative competition."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

{#if errorMessage}
	<Container>
		<DisplayError
			link={{ href: frontendUrls.PUZZLE_CREATE, text: "Go to create a puzzle" }}
			message={errorMessage}
		/>
	</Container>
{:else}
	<Container>
		<LogicalUnit
			class="flex flex-col md:flex-row md:items-center md:justify-between"
		>
			<div class="flex items-center gap-4">
				<H1>Multiplayer</H1>
				<ConnectionStatus {wsManager} state={connectionState} />
			</div>

			<div class="flex flex-col gap-2 md:flex-row md:gap-4">
				{#if room && room.roomId}
					<Button
						data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM}
						onclick={() => {
							if (!room?.roomId) {
								return;
							}

							sendWaitingRoomMessage({
								event: waitingRoomEventEnum.LEAVE_ROOM,
								roomId: room.roomId
							});

							room = undefined;
						}}
					>
						Leave room
					</Button>

					{#if $authenticatedUserInfo?.userId && isAuthor(room?.owner.userId, $authenticatedUserInfo?.userId)}
						<Button
							data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM}
							onclick={() => {
								if (!room?.roomId) {
									return;
								}

								sendWaitingRoomMessage({
									event: waitingRoomEventEnum.START_GAME,
									roomId: room.roomId
								});
							}}
						>
							Start room
						</Button>
					{/if}
				{:else}
					<Button
						data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM}
						onclick={() => {
							sendWaitingRoomMessage({
								event: waitingRoomEventEnum.HOST_ROOM
							});
						}}
					>
						Host room
					</Button>
					<!-- TODO: give ability to host a custom room -->
				{/if}
			</div>
		</LogicalUnit>

		{#if room}
			<p>waiting for the room to start</p>

			<ul>
				{#each room.users as user}
					<li class="list-inside list-disc">
						{user.username}{#if isAuthor(room.owner.userId, user.userId)}
							{` - Host!`}{/if}
					</li>
				{/each}
			</ul>
		{:else if rooms && rooms.length > 0}
			<ul>
				{#each rooms as joinableRoom}
					<li>
						<Button
							data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM}
							onclick={() => {
								sendWaitingRoomMessage({
									event: waitingRoomEventEnum.JOIN_ROOM,
									roomId: joinableRoom.roomId
								});
							}}
						>
							Join a room with {joinableRoom.amountOfPlayersJoined} other players!
						</Button>
					</li>
				{/each}
			</ul>
		{:else}
			<p>
				No rooms are being hosted by other players. You can host one yourself by
				clicking on the "host room" button.
			</p>
		{/if}
	</Container>
{/if}
