<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import DisplayError from "@/components/error/display-error.svelte";
	import ConnectionStatus from "@/components/websocket/connection-status.svelte";
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import Loader from "@/components/ui/loader/loader.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as Resizable from "@/components/ui/resizable";
	import { buildWebSocketUrl } from "@/config/websocket";
	import {
		codincodApiWebGameControllerSubmitCode,
		codincodApiWebGameControllerShow,
		codincodApiWebGameControllerJoin
	} from "@/api/generated/games/games";
	import Chat from "@/features/chat/components/chat.svelte";
	import StandingsTable from "@/features/game/standings/components/standings-table.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo } from "@/stores/auth.store";
	import { currentTime } from "@/stores/current-time.store";
	import { logger } from "@/utils/debug-logger";
	import { PhoenixSocketManager } from "@/websocket/phoenix-socket-manager.svelte";
	import {
		WEBSOCKET_STATES,
		type WebSocketState
	} from "@/websocket/websocket-constants";
	import dayjs from "dayjs";
	import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
	import { httpResponseCodes } from "$lib/types/core/common/enum/http-response-codes.js";
	import { isAuthor } from "$lib/types/utils/functions/is-author.js";
	import { isString } from "$lib/types/utils/functions/is-string.js";
	import { getUserIdFromUser } from "$lib/types/utils/functions/get-user-id-from-user.js";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import {
		webSocketUrls,
		phoenixChannels
	} from "$lib/types/core/common/config/web-socket-urls.js";
	import { SUBMISSION_BUFFER_IN_MILLISECONDS } from "$lib/types/core/game/config/game-config.js";
	import { type GameResponse } from "$lib/api/generated/schemas/gameResponse.js";
	import { type GameResponsePlayersItem } from "$lib/api/generated/schemas/gameResponsePlayersItem.js";
	import { type PuzzleResponse } from "$lib/api/generated/schemas/puzzleResponse.js";
	import { type SubmissionResponse } from "$lib/api/generated/schemas/submissionResponse.js";
	import { type UserShowResponse } from "$lib/api/generated/schemas/userShowResponse.js";
	import { type ChatMessage } from "$lib/types/core/chat/schema/chat-message.schema.js";
	import {
		GAME_CHANNEL_SERVER_EVENTS,
		GAME_CHANNEL_CLIENT_EVENTS
	} from "$lib/types/core/websocket/config/game-channel-events.js";
	import {
		validators,
		type PlayerOnlinePayload,
		type PlayerCodeUpdatedPayload,
		type PlayerSubmittedPayload,
		type PlayerReadyPayload,
		type ChatMessageReceivedPayload,
		type GameStateUpdatedPayload
	} from "$lib/types/core/websocket/schema/game-channel-payloads.schema.js";

	// Type aliases for better readability
	type GameDto = GameResponse;
	type PuzzleDto = PuzzleResponse;
	type SubmissionDto = SubmissionResponse;
	type UserDto = UserShowResponse;

	// Access layout data which includes wsToken for WebSocket authentication
	let { data } = $props();

	// Validation functions
	function isSubmissionDto(data: unknown): data is SubmissionDto {
		return typeof data === "object" && data !== null && "id" in data;
	}

	function isUserDto(data: unknown): data is UserDto {
		return typeof data === "object" && data !== null && "user" in data;
	}

	function isUserIdInUserList(
		userId: string,
		players: (UserDto | string | GameResponsePlayersItem)[] = []
	): boolean {
		return players.some((player) => {
			if (typeof player === "string") return player === userId;
			if ("id" in player && player.id) return player.id === userId;
			return getUserIdFromUser(player) === userId;
		});
	}

	const gameIdParam = page.params.id;

	if (!gameIdParam) {
		throw new Error("Game ID is required");
	}

	const gameId: string = gameIdParam;

	let isGameOver = $state(false);

	let game: GameResponse | undefined = $state();
	let puzzle: PuzzleResponse | undefined = $state();
	let errorMessage: string | undefined = $state();
	let chatMessages: ChatMessage[] = $state([]);
	const playerLanguages: Record<string, string> = $state({});
	let connectionState = $state<WebSocketState>(WEBSOCKET_STATES.DISCONNECTED);
	let onlinePlayers = $state<Set<string>>(new Set());

	/**
	 * Handle incoming Phoenix Channel events
	 */
	function handleGameMessage(event: string, payload: unknown) {
		logger.ws("Received game event", { event, payload });

		switch (event) {
			case GAME_CHANNEL_SERVER_EVENTS.PRESENCE_STATE: {
				// Full presence state on join
				logger.ws("Received presence_state", payload);
				updatePresenceFromState(payload);
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.PRESENCE_DIFF: {
				// Incremental presence updates
				logger.ws("Received presence_diff", payload);
				updatePresenceFromDiff(payload);
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.PLAYER_ONLINE: {
				if (validators.playerOnline(payload)) {
					logger.ws(`Player ${payload.username} came online`);
				} else {
					logger.error("Invalid player_online payload", payload);
				}
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.PLAYER_CODE_UPDATED: {
				if (validators.playerCodeUpdated(payload)) {
					if (payload.language) {
						playerLanguages[payload.username] = payload.language;
					}
				} else {
					logger.error("Invalid player_code_updated payload", payload);
				}
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.PLAYER_SUBMITTED: {
				if (validators.playerSubmitted(payload)) {
					logger.ws(`Player ${payload.username} submitted`);
					// Reload game state to get updated submissions
					loadGameState();
				} else {
					logger.error("Invalid player_submitted payload", payload);
				}
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.PLAYER_READY: {
				if (validators.playerReady(payload)) {
					logger.ws(`Player ${payload.username} is ready`);
				} else {
					logger.error("Invalid player_ready payload", payload);
				}
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.CHAT_MESSAGE: {
				if (validators.chatMessageReceived(payload)) {
					const chatMessage: ChatMessage = {
						message: payload.message,
						username: payload.username,
						createdAt: payload.timestamp || new Date().toISOString()
					};
					chatMessages = [...chatMessages, chatMessage];
				} else {
					logger.error("Invalid chat_message payload", payload);
				}
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.GAME_STATE_UPDATED: {
				if (validators.gameStateUpdated(payload)) {
					// Game state changed, reload
					loadGameState();
				} else {
					logger.error("Invalid game_state_updated payload", payload);
				}
				break;
			}
			case GAME_CHANNEL_SERVER_EVENTS.GAME_COMPLETED: {
				// Game is complete
				logger.ws("Game completed!", payload);
				isGameOver = true;
				loadGameState(); // Reload to get final state
				break;
			}
			default: {
				logger.error("Unknown game event", { event, payload });
			}
		}
	}

	/**
	 * Update presence state from full state (on join)
	 */
	function updatePresenceFromState(state: unknown) {
		if (typeof state !== "object" || state === null) return;

		const newOnline = new Set<string>();
		for (const [userId, _presenceData] of Object.entries(state)) {
			newOnline.add(userId);
		}
		onlinePlayers = newOnline;
		logger.ws(
			`Updated presence state: ${onlinePlayers.size} players online`,
			Array.from(onlinePlayers)
		);
	}

	/**
	 * Update presence from diff (incremental updates)
	 */
	function updatePresenceFromDiff(diff: unknown) {
		if (typeof diff !== "object" || diff === null) return;

		const typedDiff = diff as {
			joins?: Record<string, unknown>;
			leaves?: Record<string, unknown>;
		};

		// Handle joins
		if (typedDiff.joins) {
			for (const userId of Object.keys(typedDiff.joins)) {
				onlinePlayers.add(userId);
				logger.ws(`Player joined: ${userId}`);
			}
		}

		// Handle leaves
		if (typedDiff.leaves) {
			for (const userId of Object.keys(typedDiff.leaves)) {
				onlinePlayers.delete(userId);
				logger.ws(`Player left: ${userId}`);
			}
		}

		logger.ws(
			`Updated presence diff: ${onlinePlayers.size} players online`,
			Array.from(onlinePlayers)
		);
	}

	/**
	 * Load game state from backend
	 */
	async function loadGameState() {
		try {
			const gameResponse = await codincodApiWebGameControllerShow(gameId);

			// The API now returns the game object directly
			game = gameResponse;

			// Puzzle is nested within the game response
			if (gameResponse.puzzle) {
				puzzle = gameResponse.puzzle;
			}

			logger.ws("Game state loaded", { game, puzzle });
		} catch (error) {
			logger.error("Failed to load game state", error);
			errorMessage = "Failed to load game state";
		}
	}

	const wsManager = new PhoenixSocketManager({
		url: buildWebSocketUrl(webSocketUrls.ROOT),
		topic: phoenixChannels.game(gameId),
		params: {
			userId: $authenticatedUserInfo?.userId
			// No token needed - browser automatically sends HTTP-only cookies
		},
		onMessage: handleGameMessage,
		onStateChange: (state) => {
			connectionState = state;
		},
		onJoinError: (reason) => {
			errorMessage = reason;
		}
	});

	// Load initial game state and connect WebSocket
	$effect(() => {
		if (browser) {
			loadGameState();
			wsManager.connect();
		}

		return () => {
			wsManager.destroy();
		};
	});

	let isNotPlayerInGame = $derived(
		Boolean(
			$authenticatedUserInfo?.userId &&
				!isUserIdInUserList($authenticatedUserInfo.userId, game?.players ?? [])
		)
	);

	let endDate: Date | undefined = $derived.by(() => {
		if (!game?.startedAt || !game?.timeLimit) return undefined;

		const startTime = dayjs(game.startedAt);

		return startTime.add(game.timeLimit, "seconds").toDate();
	});

	$effect(() => {
		const now = $currentTime;

		const gameIsInThePast =
			endDate &&
			dayjs(endDate.getTime() + SUBMISSION_BUFFER_IN_MILLISECONDS).isBefore(
				now
			);

		// TODO: Backend API doesn't yet return playerSubmissions
		// Need to add submissions array to GameResponse schema
		const playerHasSubmitted = false;

		isGameOver = Boolean(isGameOver || gameIsInThePast || playerHasSubmitted);
	});

	function findPlayerSubmission(
		playerId: string
	): SubmissionResponse | undefined {
		// TODO: Backend API doesn't yet return playerSubmissions
		// Need to add submissions array to GameResponse schema
		return undefined;
	}

	async function onPlayerSubmitCode(submissionId: string) {
		if (!isGameOver && $authenticatedUserInfo) {
			await codincodApiWebGameControllerSubmitCode(gameId, { submissionId });

			// Notify other players via WebSocket
			wsManager.push(GAME_CHANNEL_CLIENT_EVENTS.SUBMISSION_RESULT, {
				status: "submitted",
				executionTime: 0,
				submissionId
			});

			isGameOver = true;
		}
	}

	async function sendMessage(composedMessage: string) {
		if (!$authenticatedUserInfo) {
			return;
		}

		// Send chat message via Phoenix channel
		wsManager.push(GAME_CHANNEL_CLIENT_EVENTS.CHAT_MESSAGE, {
			message: composedMessage
		});
	}

	function onPlayerChangeLanguage(language: string) {
		// Notify other players of language change
		wsManager.push(GAME_CHANNEL_CLIENT_EVENTS.CODE_UPDATE, {
			code: "", // Code will be sent separately
			language
		});
	}

	async function joinGame() {
		try {
			const gameResponse = await codincodApiWebGameControllerJoin(gameId);
			game = gameResponse;
			// Reload full game state
			await loadGameState();
		} catch (error) {
			logger.error("Failed to join game", error);
			errorMessage = "Failed to join game";
		}
	}
</script>

<svelte:head>
	<title>Multiplayer game | CodinCod</title>
	<meta
		name="description"
		content="Sharpen your skills in live coding duels! Get instant feedback from opponents and learn faster through collaborative competition."
	/>
	{#if puzzle && isUserDto(puzzle.author)}
		<meta name="author" content={`${puzzle.author.username}`} />
	{:else}
		<meta name="author" content="CodinCod contributors" />
	{/if}
</svelte:head>

{#if !$authenticatedUserInfo}
	<Container>
		<DisplayError
			link={{ href: frontendUrls.LOGIN, text: "Go to login" }}
			status={httpResponseCodes.CLIENT_ERROR.FORBIDDEN}
			message="You have to login in order to play!"
		/>
	</Container>
{:else if errorMessage}
	<Container>
		<DisplayError
			link={{ href: frontendUrls.MULTIPLAYER, text: "Go to Multiplayer" }}
			status={httpResponseCodes.CLIENT_ERROR.NOT_FOUND}
			message={errorMessage}
		/>
	</Container>
{:else if !game}
	<Container>
		<Loader />
	</Container>
{:else if isGameOver}
	<Container>
		<LogicalUnit>
			{#if getUserIdFromUser(game.owner) === $authenticatedUserInfo.userId}
				<Button
					variant="outline"
					data-testid={testIds.MULTIPLAYER_BY_ID_PAGE_BUTTON_CREATE_THE_SAME_CONFIGURED_GAME}
				>
					<WorkInProgress />: Create a game with the same options
					<!-- TODO: add option to create a game options used in the previous game, only for custom games tho?
						should you first check whether there is a similar game in the lobby and throw everyone that way or take everyone to the next game 
					-->
				</Button>
			{/if}

			<Button
				data-testid={testIds.MULTIPLAYER_BY_ID_PAGE_ANCHOR_MULTIPLAYER}
				variant="outline"
				onclick={() => goto(frontendUrls.MULTIPLAYER)}
			>
				Go to multiplayer
			</Button>
		</LogicalUnit>

		{#if !game}
			<Loader />
		{:else}
			<!-- TODO: Backend API doesn't yet return playerSubmissions -->
			<P>Game over! Check back soon for full standings.</P>
		{/if}
	</Container>
{:else if isNotPlayerInGame}
	<Container>
		<Button
			data-testid={testIds.MULTIPLAYER_BY_ID_PAGE_BUTTON_JOIN_ONGOING_GAME}
			onclick={joinGame}
		>
			Would you like to join this ongoing game?
		</Button>
	</Container>
{:else if puzzle && game}
	<Container>
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane class="mr-4 flex flex-col gap-4 md:gap-8 lg:gap-12">
				<PlayPuzzle
					{puzzle}
					{onPlayerSubmitCode}
					{onPlayerChangeLanguage}
					{endDate}
				/>
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane
				class="ml-4 flex max-w-sm min-w-[10%] flex-col gap-4 md:gap-8 lg:gap-12"
			>
				<div class="flex items-center gap-2">
					<H2>Standings - <WorkInProgress /></H2>

					{#if wsManager}
						<ConnectionStatus {wsManager} state={connectionState} />
					{/if}
				</div>

				{#if game.players}
					<ul data-testid={testIds.GAME_COMPONENT_PLAYER_RANKINGS}>
						{#each game.players as player}
							{@const playerId = player.id ?? ""}
							{@const playerSubmission = findPlayerSubmission(playerId)}
							{@const username = player.username ?? "Unknown"}
							{@const submissionLanguage = playerLanguages[username] ?? "???"}
							{@const isOnline = onlinePlayers.has(playerId)}
							<li class="flex items-center gap-2">
								<span class={isOnline ? "text-green-500" : "text-gray-400"}>
									{isOnline ? "●" : "○"}
								</span>
								<UserHoverCard
									{username}
								/>{` - using ${submissionLanguage} - ${playerSubmission?.result?.result ?? "still busy solving the puzzle"}!`}
							</li>
						{/each}
					</ul>
				{/if}

				<Chat {chatMessages} {sendMessage} {gameId} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</Container>
{/if}
