<script lang="ts">
	import type { ComponentType } from "svelte";

	export let data: { content: ComponentType };
	let Content = data.content;
</script>

<svelte:head>
	<title>Docs | CodinCod</title>
	<meta
		name="description"
		content={`Learn how to contribute to CodinCod's open-source platform, design puzzles, or integrate our API into your projects.`}
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

{#if Content}
	<svelte:component this={Content} />
{:else}
	<p>No documentation found.</p>
{/if}
