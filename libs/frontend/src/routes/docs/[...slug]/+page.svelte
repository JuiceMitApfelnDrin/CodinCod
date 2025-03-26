<script lang="ts">
	export let data;
	let { content } = data;
</script>

<svelte:head>
	<title>Docs | CodinCod</title>
</svelte:head>

{#if content}
	<svelte:component this={content} />
{:else}
	<p>No documentation found.</p>
{/if}
