<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<small class="text-sm leading-none font-medium">
	{@render children?.()}
</small>
