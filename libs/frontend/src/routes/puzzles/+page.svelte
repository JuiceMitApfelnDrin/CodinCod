<script lang="ts">
	import * as Table from "@/components/ui/table";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Pagination from "@/components/nav/pagination.svelte";
	import {
		frontendUrls,
		type AuthenticatedInfo,
		type PaginatedQueryResponse,
		type PuzzleDto
	} from "$lib/types";
	import Button from "@/components/ui/button/button.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import PuzzleDifficultyBadge from "@/features/puzzles/components/puzzle-difficulty-badge.svelte";
	import PuzzleVisibilityBadge from "@/features/puzzles/components/puzzle-visibility-badge.svelte";
	import { testIds } from "$lib/types";
	import { isAuthenticated } from "@/stores/auth.store";
	import { logger } from "@/utils/debug-logger";

	let {
		data
	}: {
		data: {
			account: AuthenticatedInfo;
			puzzles: PaginatedQueryResponse | undefined;
		};
	} = $props();

	const puzzles = $derived(data.puzzles);

	logger.page("Rendering puzzles +page.svelte", {
		dataPresent: !!data,
		data
	});

	let items: PuzzleDto[] = $derived(puzzles?.items ?? []);
	let page: number = $derived(puzzles?.page ?? 1);
	let totalItems: number = $derived(puzzles?.totalItems ?? 0);
	let totalPages: number = $derived(puzzles?.totalPages ?? 0);

	let myPuzzlesUrl: string | undefined = $derived(
		$isAuthenticated
			? frontendUrls.userProfileByUsernamePuzzles(data.account.username)
			: undefined
	);
</script>

<svelte:head>
	<title>Learn programming concepts through solving puzzles | CodinCod</title>
	<meta
		name="description"
		content="Solve community-crafted coding puzzles, challenge players worldwide, or build your own open-source challenges. Leaderboards await!"
	/>
	<meta name="keywords" content="coding exercises, problem-solving skills" />
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container>
	<LogicalUnit
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<H1>Puzzles</H1>

		<LogicalUnit class="flex flex-row gap-2">
			{#if $isAuthenticated}
				<Button
					variant="outline"
					data-testid={testIds.PUZZLES_PAGE_ANCHOR_MY_PUZZLES}
					href={myPuzzlesUrl}>My puzzles</Button
				>
			{/if}

			<Button
				data-testid={testIds.PUZZLES_PAGE_BUTTON_CREATE_PUZZLE}
				href={frontendUrls.PUZZLE_CREATE}>Create a new puzzle</Button
			>
		</LogicalUnit>
	</LogicalUnit>

	<!-- TODO: search should come here: -->
	<!-- <Input placeholder="Search through puzzles" /> -->
	<LogicalUnit class="flex flex-col gap-8">
		{#if totalItems <= 0}
			<p data-testid={testIds.PUZZLES_PAGE_ANCHOR_PUZZLE}>
				Couldn't find any puzzles!
			</p>
		{:else}
			<div class="rounded-lg border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Title</Table.Head>
							<Table.Head>Difficulty</Table.Head>
							<Table.Head>Review status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each items as { _id, difficulty, title, visibility }}
							<Table.Row>
								<Table.Cell>
									<a
										class="link"
										data-testid={testIds.PUZZLES_PAGE_ANCHOR_PUZZLE}
										href={frontendUrls.puzzleById(_id)}
									>
										{title}
									</a>
								</Table.Cell>

								<Table.Cell>
									<PuzzleDifficultyBadge {difficulty} />
								</Table.Cell>

								<Table.Cell>
									<PuzzleVisibilityBadge {visibility} />
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<p class="w-full text-center text-stone-300 dark:text-stone-400">
				Puzzles found {totalItems}
			</p>

			<Pagination {totalPages} currentPage={page} />
		{/if}
	</LogicalUnit>
</Container>
