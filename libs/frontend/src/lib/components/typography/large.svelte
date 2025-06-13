<script lang="ts">
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="text-lg font-semibold">
	{@render children?.()}
</div>
