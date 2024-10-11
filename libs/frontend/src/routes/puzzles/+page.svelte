<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Ul from "@/components/typography/ul.svelte";
	import P from "@/components/typography/p.svelte";
	import Pagination from "@/components/nav/pagination.svelte";
	import { frontendUrls } from "types";
	import { buildFrontendUrl } from "@/config/frontend.js";
	import Button from "@/components/ui/button/button.svelte";

	export let data;

	const { items, page, totalItems, totalPages } = data;
</script>

<Container>
	<div class="flex flex-col md:flex-row md:items-center md:justify-between">
		<H1 class="my-8 pb-0">Puzzles</H1>

		<div class="flex flex-col gap-2 md:flex-row md:gap-4">
			<Button href={frontendUrls.PUZZLE_CREATE}>Create a new puzzle</Button>
		</div>
	</div>

	<!-- TODO: search should come here: -->
	<!-- <Input placeholder="Search through puzzles" /> -->
	{#if totalItems <= 0}
		<P>Couldn't find any puzzles!</P>
	{:else}
		<P>
			Puzzles found {totalItems}:
		</P>
		<Ul>
			{#each items as puzzle}
				<li>
					<a href={buildFrontendUrl(frontendUrls.PUZZLE_BY_ID, { id: puzzle._id })}
						>{puzzle.title}</a
					>
				</li>
			{/each}
		</Ul>

		<Pagination {totalPages} currentPage={page}></Pagination>
	{/if}
</Container>
