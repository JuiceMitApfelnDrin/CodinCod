<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";

	export let data;
	let { puzzle } = data;
</script>

<svelte:head>
	<title>Play {puzzle.title} | CodinCod</title>
</svelte:head>

{#if puzzle}
	<Container>
		<PlayPuzzle endDate={undefined} {puzzle} />
	</Container>
{/if}
