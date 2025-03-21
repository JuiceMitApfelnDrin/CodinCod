<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import DisplayError from "@/components/error/display-error.svelte";
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import Loader from "@/components/ui/loader/loader.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as Resizable from "@/components/ui/resizable";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import Chat from "@/features/chat/components/chat.svelte";
	import StandingsTable from "@/features/game/standings/components/standings-table.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo } from "@/stores";
	import { currentTime } from "@/stores/current-time";
	import dayjs from "dayjs";
	import {
		buildFrontendUrl,
		frontendUrls,
		httpRequestMethod,
		httpResponseCodes,
		isAuthor,
		isString,
		isSubmissionDto,
		isUserDto,
		SUBMISSION_BUFFER_IN_MILLISECONDS,
		webSocketUrls,
		type GameDto,
		type PuzzleDto,
		type SubmissionDto,
		type UserDto,
		type GameSubmissionParams,
		getUserIdFromUser,
		type ChatMessage,
		isGameResponse,
		gameEventEnum,
		sendMessageOfType,
		type GameRequest,
		gameRequestSchema,
		isGameRequest
	} from "types";

	function isUserIdInUserList(userId: string, players: (UserDto | string)[] = []): boolean {
		return players.some((player) => getUserIdFromUser(player) === userId);
	}

	const gameId = $page.params.id;

	let isGameOver = false;

	let game: GameDto | undefined;
	let puzzle: PuzzleDto | undefined;
	let errorMessage: string | undefined;
	let chatMessages: ChatMessage[] = [];
	const playerLanguages: Record<string, string> = {};

	function connectWithWebsocket() {
		if (socket) {
			socket.close();
		}

		const webSocketUrl = buildWebSocketBackendUrl(webSocketUrls.GAME, { id: $page.params.id });
		socket = new WebSocket(webSocketUrl);

		socket.addEventListener("open", (message) => {
			console.info("WebSocket connection opened");
		});

		socket.addEventListener("close", (message) => {
			console.info("WebSocket connection closed");

			setTimeout(function () {
				connectWithWebsocket();
			}, 1000);
		});

		socket.addEventListener("error", (message) => {
			console.info("WebSocket connection error");
			socket.close();
		});

		socket.addEventListener("message", async (message) => {
			const receivedInformation = JSON.parse(message.data);

			if (!isGameResponse(receivedInformation)) {
				throw new Error("unknown / unhandled game response");
			}

			const { event } = receivedInformation;

			switch (event) {
				case gameEventEnum.OVERVIEW_GAME:
					{
						game = receivedInformation.game;

						if (receivedInformation.puzzle) {
							puzzle = receivedInformation.puzzle;
						}
					}
					break;
				case gameEventEnum.NONEXISTENT_GAME:
					errorMessage = receivedInformation.message;
					break;
				case gameEventEnum.FINISHED_GAME:
					{
						game = receivedInformation.game;
						isGameOver = true;
					}
					break;
				case gameEventEnum.SEND_MESSAGE:
					{
						chatMessages = [...chatMessages, receivedInformation.chatMessage];
					}
					break;
				case gameEventEnum.CHANGE_LANGUAGE:
					{
						playerLanguages[receivedInformation.username] = receivedInformation.language;
					}
					break;
				case gameEventEnum.ERROR:
					{
						console.error(receivedInformation.message);
					}
					break;
				default:
					receivedInformation satisfies never;
					break;
			}
		});
	}

	let socket: WebSocket;
	if (browser) {
		connectWithWebsocket();
	}

	let isNotPlayerInGame = true;
	$: {
		isNotPlayerInGame = Boolean(
			$authenticatedUserInfo?.userId &&
				!isUserIdInUserList($authenticatedUserInfo.userId, game?.players ?? [])
		);
	}

	let endDate: Date | undefined;
	$: endDate = game && dayjs(game.endTime).toDate();

	$: {
		const now = $currentTime;

		const gameIsInThePast =
			endDate && dayjs(endDate.getTime() + SUBMISSION_BUFFER_IN_MILLISECONDS).isBefore(now);

		const playerHasSubmitted = game?.playerSubmissions.some((submission) => {
			if (!isSubmissionDto(submission) || !$authenticatedUserInfo?.userId) {
				return false;
			}

			const playerId = getUserIdFromUser(submission.user);
			return isAuthor(playerId, $authenticatedUserInfo?.userId);
		});

		isGameOver = Boolean(isGameOver || gameIsInThePast || playerHasSubmitted);
	}

	function findPlayerSubmission(playerId: string) {
		if (!game) {
			return undefined;
		}

		const playerSubmissions: SubmissionDto[] =
			game.playerSubmissions?.filter((item) => isSubmissionDto(item)) ?? [];

		return playerSubmissions?.find((submission) => getUserIdFromUser(submission.user) === playerId);
	}

	async function onPlayerSubmitCode(submissionId: string) {
		if (!isGameOver && $authenticatedUserInfo) {
			const gameSubmissionParams: GameSubmissionParams = {
				gameId,
				submissionId,
				userId: $authenticatedUserInfo.userId
			};

			await fetchWithAuthenticationCookie(buildApiUrl(apiUrls.SUBMIT_GAME), {
				body: JSON.stringify(gameSubmissionParams),
				method: httpRequestMethod.POST
			});

			sendGameMessage(socket, {
				event: gameEventEnum.SUBMITTED_PLAYER
			});

			isGameOver = true;
		}
	}

	async function sendMessage(composedMessage: string) {
		if (!$authenticatedUserInfo) {
			return;
		}

		const newChatMessage: ChatMessage = {
			createdAt: new Date().toISOString(),
			message: composedMessage,
			username: $authenticatedUserInfo?.username
		};

		sendGameMessage(socket, {
			event: gameEventEnum.SEND_MESSAGE,
			chatMessage: newChatMessage
		});
	}

	function onPlayerChangeLanguage(language: string) {
		sendGameMessage(socket, {
			event: gameEventEnum.CHANGE_LANGUAGE,
			language
		});
	}

	export function sendGameMessage(socket: WebSocket, data: GameRequest) {
		sendMessageOfType<GameRequest>(socket, data);
	}
</script>

{#if !$authenticatedUserInfo}
	<Container>
		<DisplayError
			link={{ href: frontendUrls.LOGIN, text: "Go to login" }}
			status={httpResponseCodes.CLIENT_ERROR.FORBIDDEN}
			message={"You have to login in order to play!"}
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
				<Button variant="outline">
					<WorkInProgress />: Create a game with the same options
					<!-- TODO: add option to create a game options used in the previous game, only for custom games tho?
						should you first check whether there is a similar game in the lobby and throw everyone that way or take everyone to the next game 
					-->
				</Button>
			{/if}

			<Button variant="outline" on:click={() => goto(buildFrontendUrl(frontendUrls.MULTIPLAYER))}>
				Go to multiplayer
			</Button>
		</LogicalUnit>

		{#if !game}
			<Loader />
		{:else if game.playerSubmissions}
			<StandingsTable bind:game />
			<!-- TODO: this is absolute shit, wtf are you doing? filtering this shit instead of something far more simple? search that simple solution! thinkge  -->
		{:else}
			<P>No player submissions for this game</P>
		{/if}
	</Container>
{:else if isNotPlayerInGame}
	<Container>
		<Button
			on:click={() => {
				sendGameMessage(socket, {
					event: gameEventEnum.JOIN_GAME
				});
			}}>Would you like to join this ongoing game?</Button
		>
	</Container>
{:else if puzzle && game}
	<Container>
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane class="mr-4 flex flex-col gap-4 md:gap-8 lg:gap-12">
				<PlayPuzzle {puzzle} {onPlayerSubmitCode} {onPlayerChangeLanguage} {endDate} />
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane class="ml-4 flex min-w-[10%] max-w-sm flex-col gap-4 md:gap-8 lg:gap-12">
				<H2>Standings - <WorkInProgress /></H2>

				{#if game.players}
					<ul>
						{#each game.players as player}
							<li>
								{#if isUserDto(player)}
									<UserHoverCard username={player.username} />{` - using ${
										findPlayerSubmission(player._id)?.language ??
										playerLanguages[player.username] ??
										"???"
									} - ${findPlayerSubmission(player._id)?.result ?? "still busy solving the puzzle"}!`}
								{:else if isString(player)}
									{player}
								{/if}
							</li>
						{/each}
					</ul>
				{/if}

				<Chat {chatMessages} {sendMessage} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</Container>
{/if}
