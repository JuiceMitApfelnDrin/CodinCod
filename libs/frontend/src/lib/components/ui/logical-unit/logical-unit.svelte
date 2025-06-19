<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	let {
		children,
		class: className = undefined
	}: {
		class?: HTMLInputAttributes["class"];
		children?: Snippet;
	} = $props();
</script>

<!-- important: should never have any classes defined by itself! -->
<div class={className}>
	{@render children?.()}
</div>
