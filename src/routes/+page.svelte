<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import { urls } from "../lib/config/routes";
	import P from "@/components/typography/p.svelte";
	import H1 from "@/components/typography/h1.svelte";

	let hi = "wassup";
</script>

<Container>
	<H1>Discover</H1>

	<a href={urls.puzzles}>Puzzles</a>
	hi there, {hi}

	<P>
		this will eventually show an overview of the currently on going games and/or games that haven't
		started yet, you can 1v1, 1vX, ...
	</P>
</Container>
