<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<small class="text-sm font-medium leading-none">
	{@render children?.()}
</small>
