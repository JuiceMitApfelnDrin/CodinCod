<script lang="ts">
	export let data;
	let { content } = data;
</script>

<svelte:head>
	<title>Docs | CodinCod</title>
	<meta
		name="description"
		content={`Learn how to contribute to CodinCod's open-source platform, design puzzles, or integrate our API into your projects.`}
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

{#if content}
	<svelte:component this={content} />
{:else}
	<p>No documentation found.</p>
{/if}
