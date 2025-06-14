<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<ul class="my-2 ml-6 list-disc [&>li]:mt-2">
	{@render children?.()}
</ul>
