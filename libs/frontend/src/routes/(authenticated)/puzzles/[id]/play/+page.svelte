<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";

	let { data } = $props();
	let { puzzle } = data;
</script>

<svelte:head>
	<title>Play {puzzle.title} | Real-time Coding Challenge | CodinCod</title>
	<meta
		name="description"
		content="Code against the clock—and other players—to solve this open-source puzzle. Will you top the leaderboard?"
	/>
	{#if puzzle.author}
		<meta name="author" content={`${puzzle.author.username}`} />
	{:else}
		<meta name="author" content="CodinCod contributors" />
	{/if}
</svelte:head>

{#if puzzle}
	<Container>
		<PlayPuzzle endDate={undefined} {puzzle} />
	</Container>
{/if}
