<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { submitGame } from "@/api/submit-game";
	import Error from "@/components/error/error.svelte";
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import Loader from "@/components/ui/loader/loader.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as Resizable from "@/components/ui/resizable";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import JoinGameConfirmationDialog from "@/features/game/components/join-game-confirmation-dialog.svelte";
	import StandingsTable from "@/features/game/standings/components/standings-table.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo } from "@/stores";
	import { currentTime } from "@/stores/current-time";
	import { getUserIdFromUser, isUserIdInUserList } from "@/utils/get-user-id-from-user";
	import dayjs from "dayjs";
	// import { EllipsisVertical, FileWarning, Settings } from "lucide-svelte";
	import { onMount } from "svelte";
	import {
		buildFrontendUrl,
		frontendUrls,
		GameEventEnum,
		httpResponseCodes,
		isString,
		isSubmissionDto,
		isUserDto,
		SUBMISSION_BUFFER_IN_MILLISECONDS,
		webSocketUrls,
		type GameState,
		type SubmissionDto
	} from "types";

	const gameId = $page.params.id;

	let isGameOver = false;

	const state: GameState = {
		errorMessage: "",
		game: undefined,
		puzzle: undefined
	};

	let socket: WebSocket;
	onMount(() => {
		const webSocketUrl = buildWebSocketBackendUrl(webSocketUrls.GAME, { id: $page.params.id });
		socket = new WebSocket(webSocketUrl);

		socket.addEventListener("open", (message) => {
			console.log("WebSocket connection opened");
		});

		socket.addEventListener("message", async (message) => {
			const receivedInformation = JSON.parse(message.data);
			const { data, event } = receivedInformation;

			console.log({ receivedInformation });

			switch (event) {
				case GameEventEnum.OVERVIEW_GAME:
					{
						if (data.game) {
							state.game = data.game;
						}
						if (data.puzzle) {
							state.puzzle = data.puzzle;
						}
					}
					break;
				case GameEventEnum.NONEXISTENT_GAME:
					state.errorMessage = receivedInformation.message;
					break;
				case GameEventEnum.FINISHED_GAME:
					{
						state.game = data.game;
						isGameOver = true;
					}
					break;
				default:
					console.log("unknown / unhandled event: ", { event });

					break;
			}
		});
	});

	let isNotPlayerInGame = true;
	$: {
		isNotPlayerInGame = Boolean(
			$authenticatedUserInfo?.userId &&
				!isUserIdInUserList($authenticatedUserInfo.userId, state.game?.players ?? [])
		);
	}

	let endDate = state.game?.endTime;
	$: endDate = state.game && dayjs(state.game.endTime).toDate();

	$: {
		const now = $currentTime;
		isGameOver = Boolean(
			isGameOver ||
				(endDate && dayjs(endDate.getTime() + SUBMISSION_BUFFER_IN_MILLISECONDS).isBefore(now)) ||
				state.game?.playerSubmissions?.some((submission) =>
					isSubmissionDto(submission) ? submission.userId === $authenticatedUserInfo?.userId : false
				)
		);
	}

	const findPlayerSubmission = (playerId: string | undefined) => {
		if (!state.game || !isString(playerId)) {
			return undefined;
		}

		const playerSubmissions: SubmissionDto[] =
			state.game.playerSubmissions?.filter((item) => isSubmissionDto(item)) ?? [];

		return playerSubmissions?.find((submission) => submission.userId === playerId);
	};

	let playerSubmissions;
	$: playerSubmissions =
		state.game?.playerSubmissions?.filter((submission) => isSubmissionDto(submission)) ?? [];

	$: console.log(playerSubmissions);
</script>

{#if state.errorMessage}
	<Container>
		<Error
			link={{ href: frontendUrls.MULTIPLAYER, message: "Go to Multiplayer" }}
			status={httpResponseCodes.CLIENT_ERROR.NOT_FOUND}
			message={state.errorMessage}
		/>
	</Container>
{:else if !state.game}
	<Container>
		<Loader />
	</Container>
{:else if isGameOver}
	<Container>
		<LogicalUnit>
			{#if getUserIdFromUser(state.game.creator) === $authenticatedUserInfo?.userId}
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

		{#if !state.game}
			<Loader />
		{:else if state.game.playerSubmissions}
			<StandingsTable {playerSubmissions} />
			<!-- TODO: this is absolute shit, wtf are you doing? filtering this shit instead of something far more simple? search that simple solution! thinkge  -->
		{:else}
			<P>No player submissions for this game</P>
		{/if}
	</Container>
{:else if isNotPlayerInGame}
	<Container>
		<JoinGameConfirmationDialog {gameId} {socket} />
	</Container>
{:else if state.puzzle && state.game}
	<Container>
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane class="mr-4 flex flex-col gap-4 md:gap-8 lg:gap-12">
				{#if state.puzzle._id}
					<PlayPuzzle
						puzzleId={state.puzzle._id}
						puzzle={state.puzzle}
						onPlayerSubmitCode={async (submissionId) => {
							if (!isGameOver && state.game?._id) {
								await submitGame({ gameId: state.game._id, submissionId });

								socket.send(
									JSON.stringify({
										event: GameEventEnum.SUBMITTED_PLAYER,
										submissionId,
										userId: $authenticatedUserInfo?.userId
									})
								);

								isGameOver = true;
							}
						}}
						{endDate}
					/>
				{/if}
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane class="ml-4 flex min-w-[10%] max-w-sm flex-col gap-4 md:gap-8 lg:gap-12">
				<H2>Chat - <WorkInProgress /></H2>

				<!-- <ol>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>

					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>

					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
					<li>
						<UserHoverCard user={state.game.players[0]} />: bla bla bla <EllipsisVertical
							class="inline"
						/> report player button
					</li>
				</ol> -->

				<LogicalUnit class="space-y-2">
					<Label class="sr-only" for="msg-compose">compose message</Label>
					<Input placeholder="message" id="msg-compose" />

					<Button variant="outline">Send message</Button>
				</LogicalUnit>

				<H2>Standings - <WorkInProgress /></H2>

				{#if state.game.players}
					<ul>
						{#each state.game.players as player}
							<li>
								{#if isUserDto(player)}
									<UserHoverCard user={player} />{` - using ${
										findPlayerSubmission(player._id)?.language ?? "???"
									} - ${findPlayerSubmission(player._id)?.result ?? "still busy solving the puzzle"}!`}
								{:else if isString(player)}
									{player}
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</Container>
{/if}
