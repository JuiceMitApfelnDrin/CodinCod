<script lang="ts">
	import { marked } from "marked";
	import P from "./p.svelte";
	import DOMPurify from "dompurify";

	interface Props {
		markdown?: string | undefined;
		fallbackText?: string;
	}

	let { markdown = undefined, fallbackText = "no fallback provided" }: Props = $props();

	const parseMarkdown = async (markdown: string) => {
		const dirtyMarkdown = await marked.parse(markdown);
		return DOMPurify.sanitize(dirtyMarkdown);
	};
</script>

{#if markdown !== undefined}
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
