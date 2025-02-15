<script lang="ts">
	import { marked } from "marked";
	import P from "./p.svelte";
	import DOMPurify from "dompurify";

	export let markdown: string | null = null;
	export let fallbackText: string = "no fallback provided";

	const parseMarkdown = async (markdown: string) => {
		const dirtyMarkdown = await marked.parse(markdown);
		return DOMPurify.sanitize(dirtyMarkdown);
	};
</script>

{#if markdown !== null}
	{#await parseMarkdown(markdown)}
		<P>Loading...</P>
	{:then parsedMarkdown}
		<div class="prose prose-stone dark:prose-invert">
			{@html parsedMarkdown}
		</div>
	{/await}
{:else}
	<p>{fallbackText}</p>
{/if}

<style>
	/* makes ascii art in Markdown code blocks look better */
	.prose :global(pre) {
		line-height: var(--code-block-line-height, normal);
	}
</style>
