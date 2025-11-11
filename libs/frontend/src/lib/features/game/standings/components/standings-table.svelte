<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import duration from "dayjs/plugin/duration";
	import minMax from "dayjs/plugin/minMax";
	import { codincodApiWebSubmissionControllerShow } from "@/api/generated/submission/submission";
	import { Button } from "@/components/ui/button";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import CodeXml from "@lucide/svelte/icons/code-xml";
	import Code from "@lucide/svelte/icons/code";
	import FishIcon from "@lucide/svelte/icons/fish";
	import FishOffIcon from "@lucide/svelte/icons/fish-off";
	import Hash from "@lucide/svelte/icons/hash";
	import Hourglass from "@lucide/svelte/icons/hourglass";
	import FileCode from "@lucide/svelte/icons/file-code";
	import { cn } from "@/utils/cn";
	import { calculatePuzzleResultIconColor } from "@/features/puzzles/utils/calculate-puzzle-result-color";
	import Codemirror from "../../components/codemirror.svelte";
	import type { GameDto } from "$lib/types/core/game/schema/game-dto.schema.js";
	import type { GameSubmission } from "$lib/types/core/game/schema/game-submission.schema.js";
	import { gameModeEnum } from "$lib/types/core/game/enum/game-mode-enum.js";
	import { isString } from "$lib/types/utils/functions/is-string.js";
	import { isObjectId } from "$lib/types/core/common/schema/object-id.js";
	import { isUserDto } from "$lib/types/core/user/schema/user-dto.schema.js";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import type { AcceptedDate } from "$lib/types/core/common/schema/accepted-date.js";

	dayjs.extend(duration);
	dayjs.extend(minMax);

	let {
		game = $bindable()
	}: {
		game: GameDto;
	} = $props();

	let isShortestMode = $derived(game.options.mode === gameModeEnum.SHORTEST);

	let submissions: GameSubmission[] = $derived(
		(game.playerSubmissions.filter(
			(submission) => !isString(submission) && !isObjectId(submission)
		) ?? []) as GameSubmission[]
	);

	// used to check whether a solution is being viewed
	let isOpen: Record<string, boolean> = $state({});

	// used for caching, check whether a solution was fetched
	let hasBeenOpened: Record<string, boolean> = $state({});

	async function fetchCode(id: string): Promise<{ code: string }> {
		const response = await codincodApiWebSubmissionControllerShow(id);
		return {
			code: response.code ?? "// Code not available"
		};
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

<div
	id="standings"
	class="rounded-lg border"
	data-testid={testIds.GAME_COMPONENT_STANDINGS_TABLE}
>
	<Table.Root>
		<Table.Caption class="sr-only">Game submissions leaderboard</Table.Caption>

		<Table.Header>
			<Table.Row>
				<Table.Head class="w-0"
					><Hash aria-hidden="true" /><span class="sr-only">Rank</span
					></Table.Head
				>
				<Table.Head>User</Table.Head>
				<Table.Head>Language</Table.Head>
				<Table.Head>Score</Table.Head>
				<Table.Head>Time</Table.Head>
				{#if isShortestMode}
					<Table.Head>Length</Table.Head>
				{/if}
				<Table.Head class="w-0"><span class="sr-only">Actions</span></Table.Head
				>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each submissions as { _id, codeLength, createdAt, programmingLanguage, result, user }, index}
				{@const language =
					isString(programmingLanguage) && programmingLanguage
						? programmingLanguage
						: isObjectId(programmingLanguage)
							? "Unknown"
							: programmingLanguage.language}

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
										class={cn(
											"icon mr-1",
											calculatePuzzleResultIconColor(result.result)
										)}
									/>
								{:else}
									<FishOffIcon
										aria-hidden="true"
										class={cn(
											"icon mr-1",
											calculatePuzzleResultIconColor(result.result)
										)}
									/>
								{/if}{Math.round(result.successRate * 100)}%
							</span>
						</Table.Cell>
						<Table.Cell>
							<span class="flex items-center">
								<Hourglass aria-hidden="true" class="icon default mr-1" />
								{formatDuration(createdAt)}
							</span>
						</Table.Cell>
						{#if isShortestMode}
							<Table.Cell>
								<span class="flex items-center">
									<FileCode aria-hidden="true" class="icon default mr-1" />
									{codeLength ?? "N/A"}
								</span>
							</Table.Cell>
						{/if}
						<Table.Cell>
							<Button
								data-testid={testIds.STANDINGS_TABLE_COMPONENT_TOGGLE_SHOW_CODE}
								variant="secondary"
								aria-expanded={isOpen[_id] ? "true" : "false"}
								aria-controls={"code-" + _id}
								onclick={() => {
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
								{:then { code }}
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
