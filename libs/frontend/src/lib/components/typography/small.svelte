<script lang="ts">
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<small class="text-sm font-medium leading-none">
	{@render children?.()}
</small>
