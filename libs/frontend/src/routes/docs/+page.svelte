<script lang="ts">
	import type { Component } from "svelte";

	let {
		data
	}: {
		data: { content: Component };
	} = $props();
	let Content = data.content;
</script>

<svelte:head>
	<title>Docs | CodinCod</title>
	<meta
		name="description"
		content="Learn how to contribute to CodinCod's open-source platform, design puzzles, or integrate our API into your projects."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

{#if Content}
	<Content />
{:else}
	<p>No documentation found.</p>
{/if}
