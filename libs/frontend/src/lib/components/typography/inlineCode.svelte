<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
	{@render children?.()}
</code>
