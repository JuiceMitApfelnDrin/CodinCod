<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";

	let {
		class: className = undefined,
		children
	}: {
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<h3 class={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>
	{@render children?.()}
</h3>
