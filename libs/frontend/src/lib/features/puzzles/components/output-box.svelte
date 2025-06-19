<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children,
		title
	}: {
		title: string;
		children?: Snippet;
	} = $props();
</script>

<p class="font-bold">{title}</p>
<div class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4 lg:max-w-full">
	<pre><code>{@render children?.()}</code></pre>
</div>

<style>
	pre {
		line-height: var(--code-block-line-height, normal);
	}
</style>
