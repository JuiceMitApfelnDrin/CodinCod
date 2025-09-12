<script lang="ts">
	let { data } = $props();
	let { content } = data;
</script>

<svelte:head>
	<title>Docs | CodinCod</title>
	<meta
		name="description"
		content="Learn how to contribute to CodinCod's open-source platform, design puzzles, or integrate our API into your projects."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

{#if content}
	{@const SvelteComponent = content}
	<SvelteComponent />
{:else}
	<p>No documentation found.</p>
{/if}
