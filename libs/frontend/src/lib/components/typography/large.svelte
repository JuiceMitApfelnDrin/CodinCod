<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<div class="text-lg font-semibold">
	{@render children?.()}
</div>
