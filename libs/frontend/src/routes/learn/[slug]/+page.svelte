<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import BecomeAContributor from "@/features/learn/components/become-a-contributor.svelte";

	let { data } = $props();
	const { content, metadata } = data;
</script>

<svelte:head>
	{#if metadata}
		<title>{metadata.title} | CodinCod</title>
		<meta property="og:type" content="article" />
		<meta property="og:title" content={metadata.title} />
		<meta property="article:section" content="Programming" />
		<meta property="article:tag" content={$page.params.slug} />
		<meta property="article:tag" content="Programming language" />
	{/if}
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container>
	{@const SvelteComponent = content}
	<div class="prose prose-stone dark:prose-invert">
		<SvelteComponent />
	</div>

	<BecomeAContributor />
</Container>
