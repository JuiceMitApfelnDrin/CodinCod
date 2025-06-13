<script lang="ts">
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<h4 class="scroll-m-20 text-xl font-semibold tracking-tight">
	{@render children?.()}
</h4>
