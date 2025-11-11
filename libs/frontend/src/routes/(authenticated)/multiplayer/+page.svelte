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
	import { buildWebSocketUrl } from "@/config/websocket";
	import { authenticatedUserInfo } from "@/stores/auth.store";
	import { PhoenixSocketManager } from "@/websocket/phoenix-socket-manager.svelte";
	import {
		WEBSOCKET_STATES,
		type WebSocketState
	} from "@/websocket/websocket-constants";
	import { currentTime } from "@/stores/current-time.store";
	import Chat from "@/features/chat/components/chat.svelte";
	import { Input } from "#/ui/input";
	import { waitingRoomEventEnum } from "$lib/types/core/game/enum/waiting-room-event-enum.js";
	import { isAuthor } from "$lib/types/utils/functions/is-author.js";
	import type {
		RoomOverviewResponse,
		RoomStateResponse,
		WaitingRoomResponse
	} from "$lib/types/core/game/schema/waiting-room-response.schema.js";
	import type { WaitingRoomRequest } from "$lib/types/core/game/schema/waiting-room-request.schema.js";
	import type { GameOptions } from "$lib/types/core/game/schema/game-options.schema.js";
	import type { ChatMessage } from "$lib/types/core/chat/schema/chat-message.schema.js";
	import { webSocketUrls } from "$lib/types/core/common/config/web-socket-urls.js";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import { frontendUrls } from "@codincod/shared/constants/frontend-urls";

	// Access layout data which includes wsToken for WebSocket authentication
	let { data } = $props();

	let room: RoomStateResponse | undefined = $state();
	let rooms: RoomOverviewResponse[] = $state([]);
	let errorMessage: string | undefined = $state();
	let connectionState = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);
	let pendingGameStart: { gameUrl: string; startTime: Date } | undefined =
		$state();
	let customGameDialogOpen = $state(false);
	let joinByInviteDialogOpen = $state(false);
	let chatMessages = $state<Array<ChatMessage>>([]);
	let showInviteCode = $state(false);

	const queryParamKeys = {
		ROOM_ID: "roomId"
	};

	function updateRoomIdInUrl() {
		const currentRoomIdInUrl = query.get(queryParamKeys.ROOM_ID);

		if (room?.roomId) {
			// Only update URL if it's different
			if (currentRoomIdInUrl !== room.roomId) {
				query.set(queryParamKeys.ROOM_ID, room.roomId);
				goto(`?${query.toString()}`, { replaceState: true, keepFocus: true });
			}
		} else {
			// Only clear URL if there was a roomId
			if (currentRoomIdInUrl) {
				query.delete(queryParamKeys.ROOM_ID);
				goto(`?${query.toString()}`, { replaceState: true, keepFocus: true });
			}
		}
	}

	function checkForRoomId() {
		const roomId = query.get(queryParamKeys.ROOM_ID);

		if (!roomId) {
			return;
		}

		console.log("🔵 Auto-joining room from URL:", roomId);
		sendLobbyMessage({
			event: waitingRoomEventEnum.JOIN_ROOM,
			roomId
		});
	}

	// Handle lobby-level messages (room list updates)
	function handleLobbyMessage(event: string, data: WaitingRoomResponse) {
		console.log("🔵 Lobby message:", event, data);
		switch (event) {
			case waitingRoomEventEnum.OVERVIEW_OF_ROOMS:
				{
					if (data.event === waitingRoomEventEnum.OVERVIEW_OF_ROOMS) {
						rooms = data.rooms;
					}
				}
				break;
			case "room_created":
				{
					// Server tells us to join the room we just created
					const roomId = (data as any).roomId;
					if (roomId) {
						console.log("🔵 Room created, setting room state:", roomId);
						room = {
							roomId,
							users: [],
							owner: { userId: "", username: "" },
							inviteCode: roomId
						} as any;
					}
				}
				break;
			case waitingRoomEventEnum.JOIN_ROOM:
				{
					// Server acknowledges join_room, telling us the roomId to connect to
					const roomId = (data as any).roomId;
					if (roomId) {
						console.log("🔵 Join approved, setting room state:", roomId);
						room = {
							roomId,
							users: [],
							owner: { userId: "", username: "" },
							inviteCode: roomId
						} as any;
					}
				}
				break;
			default: {
				console.log("🔵 Unhandled lobby event:", event);
			}
		}
	}

	// Handle room-specific messages (player updates, chat, game start)
	function handleRoomMessage(event: string, data: WaitingRoomResponse) {
		console.log("🟢 Room message:", event, data);
		switch (event) {
			case waitingRoomEventEnum.OVERVIEW_ROOM:
				{
					if (data.event === waitingRoomEventEnum.OVERVIEW_ROOM) {
						// Update room state from room-specific channel
						room = data.room;
					}
				}
				break;
			case waitingRoomEventEnum.CHAT_MESSAGE:
				{
					if (data.event === waitingRoomEventEnum.CHAT_MESSAGE) {
						chatMessages.push({
							username: data.username,
							message: data.message,
							createdAt: new Date(data.createdAt)
						});

						chatMessages = chatMessages; // Trigger reactivity
					}
				}
				break;
			case waitingRoomEventEnum.START_GAME:
				{
					if (data.event === waitingRoomEventEnum.START_GAME) {
						console.log("🎮 START_GAME event received:", {
							gameUrl: data.gameUrl,
							startTime: data.startTime,
							parsed: new Date(data.startTime).toISOString()
						});
						pendingGameStart = {
							gameUrl: data.gameUrl,
							startTime: new Date(data.startTime)
						};
						console.log("🎮 pendingGameStart set:", pendingGameStart);
					}
				}
				break;
			case waitingRoomEventEnum.NOT_ENOUGH_PUZZLES:
				{
					if (data.event === waitingRoomEventEnum.NOT_ENOUGH_PUZZLES) {
						errorMessage = data.message;
					}
				}
				break;
			case waitingRoomEventEnum.ERROR:
				{
					if (data.event === waitingRoomEventEnum.ERROR) {
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
				}
				break;
			default: {
				console.log("🟢 Unhandled room event:", event);
			}
		}
	}

	let lobbyWsManager: PhoenixSocketManager | undefined = $state();
	let roomWsManager: PhoenixSocketManager | undefined = $state();

	// Create lobby manager for browsing rooms
	function createLobbyManager() {
		console.log("🔵 Creating lobby manager");
		return new PhoenixSocketManager({
			url: buildWebSocketUrl(webSocketUrls.ROOT),
			topic: "waiting_room:lobby",
			params: {},
			onMessage: handleLobbyMessage,
			onStateChange: (state) => {
				connectionState = state;
				if (state === "connected") {
					checkForRoomId();
				}
			}
		});
	}

	// Create room manager for specific room
	function createRoomManager(roomId: string) {
		console.log("🟢 Creating room manager for:", roomId);
		return new PhoenixSocketManager({
			url: buildWebSocketUrl(webSocketUrls.ROOT),
			topic: `waiting_room:${roomId}`,
			params: {},
			onMessage: handleRoomMessage,
			onStateChange: (state) => {
				console.log("🟢 Room channel state:", state);
			}
		});
	}

	// Connect to lobby when component mounts
	$effect(() => {
		console.log("🔥 Lobby effect running! browser =", browser);
		if (browser && !lobbyWsManager) {
			lobbyWsManager = createLobbyManager();
			lobbyWsManager.connect().catch((err) => {
				console.error("🔥 Failed to connect to lobby:", err);
			});
		}

		return () => {
			console.log("🔥 Cleaning up lobby connection");
			lobbyWsManager?.destroy();
			lobbyWsManager = undefined;
		};
	});

	// Connect to room-specific channel when joining a room
	$effect(() => {
		if (!browser || !room?.roomId) {
			// No room, disconnect if connected
			if (roomWsManager) {
				console.log("🟢 No room, cleaning up room connection");
				roomWsManager.destroy();
				roomWsManager = undefined;
			}
			return;
		}

		const roomId = room.roomId;

		// Connect to room channel if not already connected
		if (!roomWsManager) {
			console.log("🟢 Connecting to room channel:", roomId);
			roomWsManager = createRoomManager(roomId);
			roomWsManager.connect().catch((err) => {
				console.error("� Failed to connect to room:", err);
			});
		}

		return () => {
			// Cleanup happens when room becomes undefined
		};
	});

	// Update URL when room changes
	$effect(() => {
		if (room?.roomId) {
			updateRoomIdInUrl();
		}
	});

	$effect(() => {
		if (!pendingGameStart) {
			console.log("⏱️ pendingGameStart $effect: no pending game");
			return;
		}

		const now = $currentTime.getTime();
		const startTime = new Date(pendingGameStart.startTime).getTime();
		const timeUntilStart = startTime - now;

		console.log("⏱️ pendingGameStart $effect:", {
			now: new Date(now).toISOString(),
			startTime: new Date(startTime).toISOString(),
			timeUntilStart,
			shouldNavigate: now >= startTime,
			gameUrl: pendingGameStart.gameUrl
		});

		if (now >= startTime) {
			// Clear room state before navigation to prevent loops
			const gameUrl = pendingGameStart.gameUrl;
			console.log("⏱️ NAVIGATING TO GAME:", gameUrl);
			room = undefined;
			pendingGameStart = undefined;
			chatMessages = [];

			goto(gameUrl);
		}
	});

	let query = new URLSearchParams($page.url.searchParams.toString());

	function sendLobbyMessage(data: WaitingRoomRequest) {
		if (!lobbyWsManager) {
			console.error("Lobby manager not connected");
			return;
		}
		console.log("🔵 Sending lobby message:", data);
		lobbyWsManager.push(data.event, data);
	}

	function sendRoomMessage(data: WaitingRoomRequest) {
		if (!roomWsManager) {
			console.error("Room manager not connected");
			return;
		}
		console.log("🟢 Sending room message:", data);
		roomWsManager.push(data.event, data);
	}

	function handleHostRoom(options?: GameOptions) {
		sendLobbyMessage({
			event: waitingRoomEventEnum.HOST_ROOM,
			...(options && { options })
		});
	}

	function handleJoinByInvite(inviteCode: string) {
		sendLobbyMessage({
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

		sendRoomMessage({
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
				{#if lobbyWsManager}
					<ConnectionStatus
						wsManager={lobbyWsManager}
						state={connectionState}
					/>
				{/if}
			</div>

			<div class="flex flex-col gap-2 md:flex-row md:gap-4">
				{#if room && room.roomId}
					{console.log(
						"[Multiplayer] Rendering leave button, room:",
						room.roomId
					)}
					<Button
						data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_LEAVE_ROOM}
						onclick={() => {
							if (!room?.roomId) {
								return;
							}

							const roomId = room.roomId;
							console.log("🔴 Leaving room:", roomId);

							// Send leave message to room channel
							sendRoomMessage({
								event: waitingRoomEventEnum.LEAVE_ROOM,
								roomId
							});

							// Clear local state immediately
							room = undefined;
							chatMessages = [];
							pendingGameStart = undefined;

							// Disconnect from room channel
							if (roomWsManager) {
								roomWsManager.destroy();
								roomWsManager = undefined;
							}

							// Clear URL to prevent auto-rejoin
							query.delete(queryParamKeys.ROOM_ID);
							goto(`?${query.toString()}`, {
								replaceState: true,
								keepFocus: true
							});
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

								console.log("🎮 Starting game:", room.roomId);
								sendRoomMessage({
									event: waitingRoomEventEnum.START_GAME,
									roomId: room.roomId
								});
							}}
							disabled={Boolean(pendingGameStart)}
						>
							Start game
						</Button>
					{/if}
				{:else if connectionState === WEBSOCKET_STATES.CONNECTED}
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
			<div class="space-y-4">
				<div
					class="bg-primary/10 flex flex-col items-center gap-4 rounded-lg border p-6"
				>
					<h2 class="text-xl font-semibold">Game Starting Soon!</h2>
					<p>Get ready! The game will begin in:</p>
					<CountdownTimer endDate={pendingGameStart.startTime} />
				</div>

				{#if room}
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<h3 class="text-lg font-semibold">Players in Game</h3>
							<ul class="space-y-1">
								{#each room.users as user}
									<li class="list-inside list-disc">
										{user.username}{#if isAuthor(room.owner.userId, user.userId)}
											{` - Host!`}{/if}
									</li>
								{/each}
							</ul>
						</div>

						{#if $authenticatedUserInfo?.username}
							<Chat
								{chatMessages}
								sendMessage={sendChatMessage}
								gameId={room.roomId}
							/>
						{/if}
					</div>
				{/if}
			</div>
		{:else if room}
			<div class="space-y-4">
				{#if room.inviteCode}
					<div class="bg-muted/50 rounded-lg border p-4">
						<p class="mb-2 text-sm font-medium">Invite Code</p>
						<div class="flex items-center gap-2">
							<Input
								data-testid={testIds.MULTIPLAYER_PAGE_INPUT_INVITE_CODE}
								type={showInviteCode ? "text" : "password"}
								value={room.inviteCode}
								readonly
								class="bg-background flex-1 rounded px-3 py-2 text-center font-mono text-2xl tracking-widest"
							/>
							<Button
								data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_TOGGLE_INVITE_CODE}
								variant="outline"
								size="sm"
								onclick={() => {
									showInviteCode = !showInviteCode;
								}}
							>
								{showInviteCode ? "Hide code" : "Show code"}
							</Button>
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
						<ul
							class="space-y-1"
							data-testid={testIds.MULTIPLAYER_PAGE_PLAYERS_LIST}
						>
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
			<ul class="grid gap-2">
				{#each rooms as joinableRoom}
					<li>
						<Button
							data-testid={testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM}
							onclick={() => {
								console.log("🔵 Joining room:", joinableRoom.roomId);
								sendLobbyMessage({
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
		{:else if connectionState === WEBSOCKET_STATES.CONNECTED}
			<p>
				No rooms are being hosted by other players. You can host one yourself by
				clicking on the "host room" button.
			</p>
		{:else}
			<p>Connecting to the server! One second please!</p>
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
