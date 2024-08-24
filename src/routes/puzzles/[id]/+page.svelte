<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { buildLocalUrl } from "@/config/routes";
	import { frontendUrls } from "types";
	import P from "@/components/typography/p.svelte";
	import H2 from "@/components/typography/h2.svelte";

	export let data;

	const { puzzle } = data;

	const editUrl = buildLocalUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: $page.params.id });
	const playUrl = buildLocalUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id: $page.params.id });
</script>

<Container class="flex flex-col gap-2">
	<H1>
		{puzzle.title}
	</H1>
	<P>puzzle was created on: {puzzle.createdAt}, and last update happened on: {puzzle.updatedAt}</P>

	<a href={editUrl}>Edit puzzle</a>
	<a href={playUrl}>Play puzzle</a>

	{#if puzzle.statement}
		<H2>Statement</H2>
		<P>
			{puzzle.statement}
		</P>
	{/if}

	{#if puzzle.constraints}
		<H2>Constraints</H2>
		<P>
			{puzzle.constraints}
		</P>
	{/if}
</Container>
