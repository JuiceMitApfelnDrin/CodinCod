<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import { urls } from "@/config/routes.js";
	import { Button } from "@/components/ui/button";
	import Ul from "@/components/typography/ul.svelte";
	import P from "@/components/typography/p.svelte";

	export let data;
	const { puzzles } = data;
</script>

<Container>
	<H1>Puzzles</H1>

	<a href={urls.puzzle_create}><Button>Create a new puzzles</Button></a>

	<P>Puzzles:</P>
	<Ul>
		{#each puzzles as puzzle}
			<li>
				<a href={`puzzles/${puzzle.id}`}>{puzzle.title}</a>
			</li>
		{/each}
	</Ul>
</Container>
