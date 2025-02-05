<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import BecomeAContributor from "@/features/learn/components/become-a-contributor.svelte";

	export let data;
</script>

<svelte:head>
	{#if data.meta}
		<title>{data.meta.title}</title>
		<meta property="og:type" content="article" />
		<meta property="og:title" content={data.meta.title} />
		<meta property="article:section" content="Programming" />
		<meta property="article:tag" content={$page.params.slug} />
		<meta property="article:tag" content="Programming language" />
	{/if}
</svelte:head>

<Container>
	<div class="prose prose-stone dark:prose-invert">
		<svelte:component this={data.content} />
	</div>

	<BecomeAContributor />
</Container>
