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
	import CountdownTimer from "@/components/ui/countdown-timer/countdown-timer.svelte";
	import CustomGameDialog from "@/features/multiplayer/components/custom-game-dialog.svelte";
	import JoinByInviteDialog from "@/features/multiplayer/components/join-by-invite-dialog.svelte";
	import WaitingRoomChat from "@/features/multiplayer/components/waiting-room-chat.svelte";
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
		type WaitingRoomResponse,
		type GameOptions,

		type ChatMessage

	} from "types";
	import { testIds } from "@/config/test-ids";
	import { currentTime } from "@/stores/current-time";
	import Chat from "@/features/chat/components/chat.svelte";

	let room: RoomStateResponse | undefined = $state();
	let rooms: RoomOverviewResponse[] = $state([]);
	let errorMessage: string | undefined = $state();
	let connectionState = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);
	let pendingGameStart: { gameUrl: string; startTime: Date } | undefined =
		$state();
	let customGameDialogOpen = $state(false);
	let joinByInviteDialogOpen = $state(false);
	let chatMessages = $state<
		Array<ChatMessage>
	>([]);

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
			case waitingRoomEventEnum.CHAT_MESSAGE:
				{
					chatMessages.push({
						username: data.username,
						message: data.message,
						createdAt: new Date(data.createdAt)
					});

					chatMessages = chatMessages; // Trigger reactivity
				}
				break;
			case waitingRoomEventEnum.START_GAME:
				{
					pendingGameStart = {
						gameUrl: data.gameUrl,
						startTime: new Date(data.startTime)
					};
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
		if (!pendingGameStart) return;

		const now = $currentTime.getTime();
		const startTime = new Date(pendingGameStart.startTime).getTime();

		if (now >= startTime) {
			goto(pendingGameStart.gameUrl);
		}
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

	function handleHostRoom(options?: GameOptions) {
		sendWaitingRoomMessage({
			event: waitingRoomEventEnum.HOST_ROOM,
			...(options && { options })
		});
	}

	function handleJoinByInvite(inviteCode: string) {
		sendWaitingRoomMessage({
			event: waitingRoomEventEnum.JOIN_BY_INVITE_CODE,
			inviteCode
		});
	}

	async function copyInviteCode(code: string) {
		try {
			await navigator.clipboard.writeText(code);
		} catch (err) {
			console.error("Failed to copy invite code:", err);
		}
	}

	function sendChatMessage(message: string) {
		if (!room?.roomId) return;

		sendWaitingRoomMessage({
			event: waitingRoomEventEnum.CHAT_MESSAGE,
			roomId: room.roomId,
			message
		});
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
							chatMessages = [];
						}}
						disabled={Boolean(pendingGameStart)}
					>
						Leave waiting room
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
							disabled={Boolean(pendingGameStart)}
						>
							Start game
						</Button>
					{/if}
				{:else}
					<Button
						data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM}
						onclick={() => handleHostRoom()}
					>
						Quick Host
					</Button>
					<Button
						data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_CUSTOM_GAME}
						variant="outline"
						onclick={() => (customGameDialogOpen = true)}
					>
						Custom Game
					</Button>
					<Button
						data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_BY_INVITE}
						variant="secondary"
						onclick={() => (joinByInviteDialogOpen = true)}
					>
						Join by Code
					</Button>
				{/if}
			</div>
		</LogicalUnit>

		{#if pendingGameStart}
			<div class="flex flex-col items-center gap-4">
				<h2 class="text-xl font-semibold">Game Starting Soon!</h2>
				<p>Get ready! The game will begin in:</p>
				<CountdownTimer endDate={pendingGameStart.startTime} />
			</div>
		{:else if room}
			<div class="space-y-4">
				{#if room.inviteCode}
					<div class="bg-muted/50 rounded-lg border p-4">
						<p class="mb-2 text-sm font-medium">
							🔒 Private Game - Invite Code:
						</p>
						<div class="flex items-center gap-2">
							<code
								class="bg-background flex-1 rounded px-3 py-2 text-center font-mono text-2xl tracking-widest"
							>
								{room.inviteCode}
							</code>
							<Button
								data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_COPY_INVITE}
								variant="outline"
								size="sm"
								onclick={() =>
									room?.inviteCode && copyInviteCode(room.inviteCode)}
							>
								Copy
							</Button>
						</div>
						<p class="text-muted-foreground mt-2 text-xs">
							Share this code with friends to let them join
						</p>
					</div>
				{/if}

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<h3 class="text-lg font-semibold">Players in Room</h3>
						<ul class="space-y-1">
							{#each room.users as user}
								<li class="list-inside list-disc">
									{user.username}{#if isAuthor(room.owner.userId, user.userId)}
										{` - Host!`}{/if}
								</li>
							{/each}
						</ul>
						<p class="text-muted-foreground text-sm">
							Waiting for the host to start the game...
						</p>
					</div>

					{#if $authenticatedUserInfo?.username}
						<Chat
							{chatMessages}
							sendMessage={sendChatMessage}
							gameId={room.roomId}
						/>
					{/if}
				</div>
			</div>
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

<CustomGameDialog
	bind:open={customGameDialogOpen}
	onHostRoom={handleHostRoom}
/>
<JoinByInviteDialog
	bind:open={joinByInviteDialogOpen}
	onJoin={handleJoinByInvite}
/>
