<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { testIds } from "@/config/test-ids";
	import PlayPuzzle from "@/features/puzzles/components/play-puzzle.svelte";
	import { isUserDto } from "types";

	export let data;
	let { puzzle } = data;
</script>

<svelte:head>
	<title>Play {puzzle.title} | Real-time Coding Challenge | CodinCod</title>
	<meta
		name="description"
		content="Code against the clock—and other players—to solve this open-source puzzle. Will you top the leaderboard?"
	/>
	{#if isUserDto(puzzle.author)}
		<meta name="author" content={`${puzzle.author.username}`} />
	{:else}
		<meta name="author" content="CodinCod contributors" />
	{/if}
</svelte:head>

<LogicalUnit data-testid={testIds.PUZZLE_PLAY_PAGE_CONTAINER}>
	{#if puzzle}
		<Container>
			<PlayPuzzle endDate={undefined} {puzzle} />
		</Container>
	{/if}
</LogicalUnit>
