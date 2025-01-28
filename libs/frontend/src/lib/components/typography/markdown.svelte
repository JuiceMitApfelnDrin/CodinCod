<script lang="ts">
	import { marked } from "marked";

	export let markdown: string | null = null;
	export let fallbackText: string = "no fallback provided";
</script>

{#if markdown}
	<div class="prose dark:prose-invert prose-stone">
		{@html marked.parse(markdown)}
	</div>
{:else}
	<p>{fallbackText}</p>
{/if}
