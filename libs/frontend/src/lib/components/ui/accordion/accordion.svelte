<script lang="ts">
	interface Props {
		id: string;
		open?: boolean;
		title?: import("svelte").Snippet;
		content?: import("svelte").Snippet;
	}

	let { id, open = $bindable(false), title, content }: Props = $props();
</script>

<details bind:open {id}>
	<summary
		>{#if title}{@render title()}{:else}no title provided{/if}</summary
	>

	{#if content}{@render content()}{:else}no content provided{/if}
</details>

<style lang="postcss">
	summary {
		@apply py-2;
	}

	details:not(:first-child) {
		@apply mt-8;
	}
</style>
