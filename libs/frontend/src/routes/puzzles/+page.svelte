<script lang="ts">
	import * as Table from "@/components/ui/table";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Pagination from "@/components/nav/pagination.svelte";
	import { buildFrontendUrl, frontendUrls, type PuzzleDto } from "types";
	import Button from "@/components/ui/button/button.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import PuzzleDifficultyBadge from "@/features/puzzles/components/puzzle-difficulty-badge.svelte";
	import PuzzleVisibilityBadge from "@/features/puzzles/components/puzzle-visibility-badge.svelte";
	import { testIds } from "@/config/test-ids";

	export let data;

	let items: PuzzleDto[] = [];
	let page: number;
	let totalItems: number;
	let totalPages: number;
	$: {
		items = data.items;
		page = data.page;
		totalItems = data.totalItems;
		totalPages = data.totalPages;
	}
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
	<LogicalUnit class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<H1>Puzzles</H1>

		<Button
			data-testid={testIds.PUZZLES_PAGE_BUTTON_CREATE_PUZZLE}
			href={frontendUrls.PUZZLE_CREATE}>Create a new puzzle</Button
		>
	</LogicalUnit>

	<!-- TODO: search should come here: -->
	<!-- <Input placeholder="Search through puzzles" /> -->
	<LogicalUnit class="flex flex-col gap-8">
		{#if totalItems <= 0}
			<p data-testid={testIds.PUZZLES_PAGE_ANCHOR_PUZZLE}>Couldn't find any puzzles!</p>
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
										href={buildFrontendUrl(frontendUrls.PUZZLE_BY_ID, { id: _id })}
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
			<p class="w-full text-center text-stone-400 dark:text-stone-600">
				Puzzles found {totalItems}
			</p>

			<Pagination {totalPages} currentPage={page} />
		{/if}
	</LogicalUnit>
</Container>
