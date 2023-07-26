<script lang="ts">
	import type { Puzzle } from '$models/puzzle.model';
	import Markdown from './Markdown.svelte';

	export let puzzle: Puzzle;
</script>

<div>
	<h1>{puzzle.title}</h1>
	<Markdown source={puzzle.statement} />
</div>
