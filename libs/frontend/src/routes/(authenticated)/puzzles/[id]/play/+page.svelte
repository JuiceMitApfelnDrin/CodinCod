<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";

	export let data;
	let { puzzle } = data;
</script>

{#if puzzle}
	<Container>
		<PlayPuzzle endDate={undefined} {puzzle} />
	</Container>
{/if}
