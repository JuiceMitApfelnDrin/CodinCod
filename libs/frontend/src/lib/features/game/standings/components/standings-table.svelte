<script lang="ts">
	import { run } from 'svelte/legacy';

	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import {
		isSubmissionDto,
		isUserDto,
		type AcceptedDate,
		type GameDto,
		type SubmissionDto
	} from "types";
	import duration from "dayjs/plugin/duration";
	import minMax from "dayjs/plugin/minMax";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { Button } from "@/components/ui/button";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { Code, CodeXml, FishIcon, FishOffIcon, Hash, Hourglass } from "lucide-svelte";
	import { cn } from "@/utils/cn";
	import { calculatePuzzleResultIconColor } from "@/features/puzzles/utils/calculate-puzzle-result-color";
	import Codemirror from "../../components/codemirror.svelte";
	dayjs.extend(duration);
	dayjs.extend(minMax);

	interface Props {
		game: GameDto;
	}

	let { game }: Props = $props();
	let submissions: SubmissionDto[] = $state([]);
	run(() => {
		submissions = game.playerSubmissions.filter((submission) => isSubmissionDto(submission));
	});

	// used to check whether a solution is being viewed
	let isOpen: Record<string, boolean> = $state({});

	// used for caching, check whether a solution was fetched
	let hasBeenOpened: Record<string, boolean> = $state({});

	async function fetchCode(id: string) {
		const url = buildApiUrl(apiUrls.SUBMISSION_BY_ID, { id });

		return await fetchWithAuthenticationCookie(url).then((res) => res.json());
	}

	function formatDuration(submissionDate: AcceptedDate) {
		const gameStartTime = dayjs(game.startTime);
		const gameplayDurationInMs = Math.min(
			dayjs(submissionDate).diff(gameStartTime),
			1000 * game.options.maxGameDurationInSeconds
		);
		return dayjs.duration(gameplayDurationInMs).format("HH:mm:ss");
	}
</script>

<div id="standings" class="rounded-lg border">
	<Table.Root>
		<Table.Caption class="sr-only">Game submissions leaderboard</Table.Caption>

		<Table.Header>
			<Table.Row>
				<Table.Head class="w-0"
					><Hash aria-hidden="true" /><span class="sr-only">Rank</span></Table.Head
				>
				<Table.Head>User</Table.Head>
				<Table.Head>Language</Table.Head>
				<Table.Head>Score</Table.Head>
				<Table.Head>Time</Table.Head>
				<Table.Head class="w-0"><span class="sr-only">Actions</span></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each submissions as { user, language, createdAt, result, _id }, index}
				{#if isUserDto(user)}
					<Table.Row>
						<Table.Cell class="text-center">{index + 1}.</Table.Cell>
						<Table.Cell><UserHoverCard username={user.username} /></Table.Cell>
						<Table.Cell>{language}</Table.Cell>
						<Table.Cell>
							<span class="flex items-center">
								{#if result.successRate === 1}
									<FishIcon
										aria-hidden="true"
										class={cn("icon mr-1", calculatePuzzleResultIconColor(result.result))}
									/>
								{:else}
									<FishOffIcon
										aria-hidden="true"
										class={cn("icon mr-1", calculatePuzzleResultIconColor(result.result))}
									/>
								{/if}{Math.round(result.successRate * 100)}%
							</span>
						</Table.Cell>
						<Table.Cell>
							<span class="flex items-center">
								<!-- todo: make this more readable for screen readers somehow -->
								<Hourglass aria-hidden="true" class="icon default mr-1" />
								{formatDuration(createdAt)}
							</span>
						</Table.Cell>
						<Table.Cell>
							<Button
								variant="secondary"
								aria-expanded={isOpen[_id] ? "true" : "false"}
								aria-controls={"code-" + _id}
								on:click={() => {
									hasBeenOpened[_id] = true;
									isOpen[_id] = !isOpen[_id];
								}}
								class="w-[17ch]"
							>
								{#if isOpen[_id]}
									<CodeXml aria-hidden="true" class="icon default mr-2" /> Hide code
								{:else}
									<Code aria-hidden="true" class="icon default mr-2" /> Show code
								{/if}
							</Button>
						</Table.Cell>
					</Table.Row>

					{#if hasBeenOpened[_id]}
						<Table.Row
							id={"code-" + index}
							aria-labelledby={"row-" + _id}
							class={cn(!isOpen[_id] && "hidden")}
						>
							<Table.Cell colspan={6} aria-live="polite" class="m-0 p-0">
								{#await fetchCode(_id)}
									<span class="p-2">Loading code...</span>
								{:then {code }}
									<Codemirror {language} value={code} readonly={true} />
								{:catch}
									<span class="p-2 text-red-500"
										>Encountered an error while fetching the submission</span
									>
								{/await}
							</Table.Cell>
						</Table.Row>
					{/if}
				{/if}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
