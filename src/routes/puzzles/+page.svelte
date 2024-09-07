<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Ul from "@/components/typography/ul.svelte";
	import P from "@/components/typography/p.svelte";
	import Pagination from "@/components/nav/pagination.svelte";
	import { frontendUrls } from "types";
	import { buildFrontendUrl } from "@/config/frontend.js";

	export let data;

	const { items, totalItems, totalPages, page } = data;
</script>

<Container>
	<H1>Puzzles</H1>

	<a href={frontendUrls.PUZZLE_CREATE}>Create a new puzzles</a>

	<P>Puzzles found {totalItems}:</P>
	<Ul>
		{#each items as puzzle}
			<li>
				<a href={buildFrontendUrl(frontendUrls.PUZZLE_BY_ID, { id: puzzle._id })}>{puzzle.title}</a>
			</li>
		{/each}
	</Ul>

	<Pagination {totalPages} currentPage={page}></Pagination>
</Container>
