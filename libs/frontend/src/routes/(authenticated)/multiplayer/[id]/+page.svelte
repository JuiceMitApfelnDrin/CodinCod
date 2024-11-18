<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Error from "@/components/error/error.svelte";
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import Loader from "@/components/ui/loader/loader.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as Resizable from "@/components/ui/resizable";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import JoinGameConfirmationDialog from "@/features/game/components/join-game-confirmation-dialog.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo } from "@/stores";
	// import { EllipsisVertical, FileWarning, Settings } from "lucide-svelte";
	import { onMount } from "svelte";
	import {
		buildFrontendUrl,
		frontendUrls,
		GameEventEnum,
		httpResponseCodes,
		isString,
		isUserDto,
		webSocketUrls,
		type GameState,
		type UserDto
	} from "types";

	const state: GameState = {
		game: undefined,
		puzzle: undefined,
		errorMessage: ""
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
			const { event, data } = receivedInformation;

			console.log({ receivedInformation });

			switch (event) {
				case GameEventEnum.OVERVIEW_GAME:
					{
						state.game = data.game;
						state.puzzle = data.puzzle;
					}
					break;
				case GameEventEnum.NONEXISTENT_GAME:
				case GameEventEnum.FINISHED_GAME:
					state.errorMessage = receivedInformation.message;
					break;
				default:
					console.log("unknown / unhandled event: ", { event });

					break;
			}
		});
	});

	function isUserIdInPlayers(userId: string, players: (string | UserDto)[] = []): boolean {
		return players.some((player) => {
			if (isUserDto(player)) {
				return player._id === userId;
			} else {
				return player === userId;
			}
		});
	}

	let isNotPlayerInGame = true;
	$: {
		isNotPlayerInGame = Boolean(
			$authenticatedUserInfo?.userId &&
				!isUserIdInPlayers($authenticatedUserInfo.userId, state.game?.players ?? [])
		);
	}

	const gameId = $page.params.id;
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
						onSubmitCode={() => {
							socket.send(GameEventEnum.SUBMITTED_PLAYER);
							goto(buildFrontendUrl(frontendUrls.MULTIPLAYER));
							console.log("submitted code");
						}}
					/>
				{/if}
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane class="ml-4 flex min-w-[10%] max-w-sm flex-col gap-4 md:gap-8 lg:gap-12">
				<H2>Chat</H2>

				<WorkInProgress />
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

				<H2>Standings</H2>

				<WorkInProgress />

				{#if state.game.players}
					<ul>
						{#each state.game.players as player}
							<li>
								{#if isUserDto(player)}
									<UserHoverCard user={player} /> - using ??? - busy!
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
