<script lang="ts">
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<p class="text-xl text-muted-foreground">
	{@render children?.()}
</p>
