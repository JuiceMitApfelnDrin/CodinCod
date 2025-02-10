<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import { isSubmissionDto, isUserDto, type GameDto, type SubmissionDto } from "types";
	import duration from "dayjs/plugin/duration";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import PuzzleResultBadge from "@/features/puzzles/components/puzzle-result-badge.svelte";
	import { Button } from "@/components/ui/button";
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { Code, CodeXml, Hash, Hourglass } from "lucide-svelte";
	import { cn } from "@/utils/cn";
	dayjs.extend(duration);

	export let game: GameDto;
	let submissions: SubmissionDto[] = [];
	$: submissions = game.playerSubmissions.filter((submission) => isSubmissionDto(submission));

	// used to check whether a solution is being viewed
	let isOpen: Record<string, boolean> = {};

	// used for caching, check whether a solution was fetched
	let hasBeenOpened: Record<string, boolean> = {};

	async function fetchCode(id: string) {
		let url = buildApiUrl(apiUrls.SUBMISSION_BY_ID, { id });
		return await fetchWithAuthenticationCookie(url).then((res) => res.json());
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
				<Table.Head>Time</Table.Head>
				<Table.Head>Result</Table.Head>
				<Table.Head class="w-0"><span class="sr-only">Actions</span></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each submissions as { user, language, createdAt, result, _id }, index}
				{#if isUserDto(user) && _id}
					<Table.Row>
						<Table.Cell class="text-center">{index + 1}.</Table.Cell>
						<Table.Cell><UserHoverCard username={user.username} /></Table.Cell>
						<Table.Cell>{language}</Table.Cell>
						<Table.Cell>
							<!-- todo: make this more readable for screen readers somehow -->
							<Hourglass aria-hidden="true" class="icon mr-1" />
							{dayjs.duration(dayjs(createdAt).diff(game.startTime)).format("HH:mm:ss")}
						</Table.Cell>
						<Table.Cell><PuzzleResultBadge {result} /></Table.Cell>
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
									<CodeXml aria-hidden="true" class="icon mr-2" /> Hide code
								{:else}
									<Code aria-hidden="true" class="icon mr-2" /> Show code
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
							<Table.Cell colspan={6} aria-live="polite">
								{#await fetchCode(_id)}
									<span class="p-2">Loading code...</span>
								{:then { code }}
									<pre><code class="block whitespace-pre p-4">{code}</code></pre>
								{:catch}
									<span class="p-2 text-red-500"
										>Encountered an error while fetching submission</span
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
