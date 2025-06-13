<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
	{@render children?.()}
</code>
