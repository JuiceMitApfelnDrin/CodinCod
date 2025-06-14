<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<blockquote class="mt-6 border-l-2 pl-6 italic">
	{@render children?.()}
</blockquote>
