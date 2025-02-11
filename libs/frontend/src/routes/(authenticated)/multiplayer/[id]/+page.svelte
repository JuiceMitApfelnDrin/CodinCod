<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Error from "@/components/error/error.svelte";
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
	import JoinGameConfirmationDialog from "@/features/game/components/join-game-confirmation-dialog.svelte";
	import StandingsTable from "@/features/game/standings/components/standings-table.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo } from "@/stores";
	import { currentTime } from "@/stores/current-time";
	import dayjs from "dayjs";
	import { onMount } from "svelte";
	import {
		buildFrontendUrl,
		frontendUrls,
		GameEventEnum,
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
		isChatMessage
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

	function connectWithWebsocket() {
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
			const { data, event } = receivedInformation;

			switch (event) {
				case GameEventEnum.OVERVIEW_GAME:
					{
						if (data.game) {
							game = data.game;
						}
						if (data.puzzle) {
							puzzle = data.puzzle;
						}
					}
					break;
				case GameEventEnum.NONEXISTENT_GAME:
					errorMessage = receivedInformation.message;
					break;
				case GameEventEnum.FINISHED_GAME:
					{
						game = data.game;
						isGameOver = true;
					}
					break;
				case GameEventEnum.SEND_MESSAGE:
					{
						const { chatMessage } = data;

						if (isChatMessage(chatMessage)) {
							chatMessages = [...chatMessages, chatMessage];
						}
					}
					break;
				default:
					console.warn("unknown / unhandled event: ", { event });

					break;
			}
		});
	}

	let socket: WebSocket;
	onMount(() => {
		connectWithWebsocket();
	});

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

	function findPlayerSubmission(playerId: string | undefined) {
		if (!game || !isString(playerId)) {
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

			socket.send(
				JSON.stringify({
					event: GameEventEnum.SUBMITTED_PLAYER,
					submissionId,
					userId: $authenticatedUserInfo?.userId
				})
			);

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

		socket.send(
			JSON.stringify({
				event: GameEventEnum.SEND_MESSAGE,
				chatMessage: newChatMessage
			})
		);
	}
</script>

{#if !$authenticatedUserInfo}
	<Container>
		<Error
			link={{ href: frontendUrls.LOGIN, text: "Go to login" }}
			status={httpResponseCodes.CLIENT_ERROR.FORBIDDEN}
			message={"You have to login in order to play!"}
		/>
	</Container>
{:else if errorMessage}
	<Container>
		<Error
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
			{#if getUserIdFromUser(game.creator) === $authenticatedUserInfo.userId}
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
		<JoinGameConfirmationDialog {gameId} {socket} />
	</Container>
{:else if puzzle && game}
	<Container>
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane class="mr-4 flex flex-col gap-4 md:gap-8 lg:gap-12">
				<PlayPuzzle {puzzle} {onPlayerSubmitCode} {endDate} />
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
										findPlayerSubmission(player._id)?.language ?? "???"
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
