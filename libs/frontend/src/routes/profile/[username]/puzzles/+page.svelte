<script lang="ts">
	import * as Table from "@/components/ui/table";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import { page } from "$app/state";
	import Pagination from "@/components/nav/pagination.svelte";
	import {
		frontendUrls,
		isPaginatedQueryResponse,
		type PaginatedQueryResponse,
		type PuzzleDto
	} from "types";
	import Button from "@/components/ui/button/button.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import PuzzleDifficultyBadge from "@/features/puzzles/components/puzzle-difficulty-badge.svelte";
	import PuzzleVisibilityBadge from "@/features/puzzles/components/puzzle-visibility-badge.svelte";
	import { testIds } from "types";
	import { authenticatedUserInfo } from "@/stores/auth.store";

	let { data }: { data: PaginatedQueryResponse | undefined } = $props();

	const DEFAULT = { items: [], page: 1, totalItems: 0, totalPages: 0 };
	let paginatedDataOrDefault = $derived(
		isPaginatedQueryResponse(data) ? data : DEFAULT
	);

	let items: PuzzleDto[] = $derived(paginatedDataOrDefault.items);
	let currentPage: number = $derived(paginatedDataOrDefault.page);
	let totalItems: number = $derived(paginatedDataOrDefault.totalItems);
	let totalPages: number = $derived(paginatedDataOrDefault.totalPages);
</script>

<svelte:head>
	<title>Puzzles created by {page.params.username} | CodinCod</title>
	<!-- TODO: create a better description here -->
	<meta
		name="description"
		content={`View all the puzzles that are publicly available and made by ${page.params.username}`}
	/>
	<!-- TODO: add better keywords here -->
	<meta name="keywords" content="coding puzzles" />
	<meta name="author" content={page.params.username} />
</svelte:head>

<Container>
	<LogicalUnit
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<H1>{page.params.username}'s puzzles</H1>

		{#if page.params.username === $authenticatedUserInfo?.username}
			<Button
				variant="outline"
				data-testid={testIds.PUZZLES_PAGE_BUTTON_CREATE_PUZZLE}
				href={frontendUrls.PUZZLE_CREATE}
			>
				Create a new puzzle
			</Button>
		{/if}
	</LogicalUnit>

	<!-- TODO: search should come here: -->
	<!-- <Input placeholder="Search through puzzles" /> -->
	<LogicalUnit class="flex flex-col gap-8">
		{#if totalItems <= 0}
			<p data-testid={testIds.PUZZLES_PAGE_ANCHOR_PUZZLE}>
				Couldn't find any puzzles!
				{#if page.params.username === $authenticatedUserInfo?.username}
					But you can <Button
						variant="outline"
						data-testid={testIds.PUZZLES_PAGE_BUTTON_CREATE_PUZZLE}
						href={frontendUrls.PUZZLE_CREATE}>create a new puzzle</Button
					> !
				{/if}
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

			<Pagination {totalPages} {currentPage} />
		{/if}
	</LogicalUnit>
</Container>
