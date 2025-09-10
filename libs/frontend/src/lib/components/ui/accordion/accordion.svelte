<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		content,
		id,
		open = $bindable(false),
		title
	}: {
		id: string;
		open?: boolean;
		title?: Snippet;
		content?: Snippet;
	} = $props();
</script>

<details bind:open {id}>
	<summary
		>{#if title}{@render title()}{:else}no title provided{/if}</summary
	>

	{#if content}{@render content()}{:else}no content provided{/if}
</details>

<style lang="postcss">
	@reference "tailwindcss";

	summary {
		@apply py-2;
	}

	details:not(:first-child) {
		@apply mt-8;
	}
</style>
