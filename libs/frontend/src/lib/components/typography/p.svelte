<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";

	let {
		children,
		class: className = undefined
	}: {
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<p class={cn("leading-7 not-first:mt-2 lg:not-first:mt-4", className)}>
	{@render children?.()}
</p>
