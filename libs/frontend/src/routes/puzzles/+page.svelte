<script lang="ts">
	import * as Table from "@/components/ui/table";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Pagination from "@/components/nav/pagination.svelte";
	import { buildFrontendUrl, frontendUrls } from "types";
	import Button from "@/components/ui/button/button.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import PuzzleDifficultyBadge from "@/features/puzzles/components/puzzle-difficulty-badge.svelte";
	import PuzzleVisibilityBadge from "@/features/puzzles/components/puzzle-visibility-badge.svelte";

	export let data;

	const { items, page, totalItems, totalPages } = data;
</script>

<Container>
	<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
		<H1>Puzzles</H1>

		<Button href={frontendUrls.PUZZLE_CREATE}>Create a new puzzle</Button>
	</LogicalUnit>

	<!-- TODO: search should come here: -->
	<!-- <Input placeholder="Search through puzzles" /> -->
	<LogicalUnit class="flex flex-col gap-4">
		{#if totalItems <= 0}
			<P>Couldn't find any puzzles!</P>
		{:else}
			<P>
				Puzzles found {totalItems}:
			</P>

			<div class="rounded-lg border">
				<Table.Root>
					<!-- <Table.Caption class="sr-only">Game submissions leaderboard</Table.Caption> -->

					<Table.Header>
						<Table.Row>
							<Table.Head>Title</Table.Head>
							<Table.Head>Difficulty</Table.Head>
							<Table.Head>Review status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each items as { title, _id, difficulty, visibility }}
							<Table.Row>
								<Table.Cell>
									<a class="link" href={buildFrontendUrl(frontendUrls.PUZZLE_BY_ID, { id: _id })}
										>{title}</a
									>
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

			<Pagination {totalPages} currentPage={page}></Pagination>
		{/if}
	</LogicalUnit>
</Container>
