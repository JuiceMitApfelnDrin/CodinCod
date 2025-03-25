<script lang="ts">
	export let data: { content: any };
	let Content = data.content;
</script>

<svelte:head>
	<title>Docs | CodinCod</title>
</svelte:head>

{#if Content}
	<svelte:component this={Content} />
{:else}
	<p>No documentation found.</p>
{/if}
