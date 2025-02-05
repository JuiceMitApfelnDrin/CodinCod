<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import { page } from "$app/stores";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";

	const puzzleId = $page.params.id;

	export let data;
	let { puzzle } = data;
</script>

{#if puzzle}
	<Container>
		<PlayPuzzle endDate={undefined} {puzzleId} {puzzle} />
	</Container>
{/if}
