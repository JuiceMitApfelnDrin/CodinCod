<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<blockquote class="mt-6 border-l-2 pl-6 italic">
	{@render children?.()}
</blockquote>
