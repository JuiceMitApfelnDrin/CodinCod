<script lang="ts">
	import { marked } from "marked";
	import { onMount } from "svelte";
	import P from "./p.svelte";
	import DOMPurify from "dompurify";

	export let markdown: string | null = null;
	export let fallbackText: string = "no fallback provided";

	let parsedMarkdown: string | null = null;
	let isLoading: boolean = true;

	const parseMarkdown = async () => {
		if (markdown) {
			const dirtyMarkdown = await marked.parse(markdown);
			parsedMarkdown = DOMPurify.sanitize(dirtyMarkdown);
		}
		isLoading = false;
	};

	// Run the async parsing when component is mounted or markdown changes
	onMount(() => {
		parseMarkdown();
	});
</script>

{#if isLoading}
	<P>Loading...</P>
{:else if parsedMarkdown}
	<div class="prose prose-stone dark:prose-invert">
		{@html parsedMarkdown}
	</div>
{:else}
	<p>{fallbackText}</p>
{/if}
