<script lang="ts">
	import type { Puzzle } from "../models/puzzle.model";
	import Markdown from "./markdown.svelte";

	export let puzzle: Puzzle;
</script>

<div>
	<H1>{puzzle.title}</H1>
	<Markdown source={puzzle.statement} />
</div>
