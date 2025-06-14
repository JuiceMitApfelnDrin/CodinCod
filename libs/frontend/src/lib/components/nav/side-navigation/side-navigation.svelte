<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<nav class="w-full rounded-lg border p-4 md:max-w-64">
	<ul class="flex flex-col gap-2">
		{@render children?.()}
	</ul>
</nav>
