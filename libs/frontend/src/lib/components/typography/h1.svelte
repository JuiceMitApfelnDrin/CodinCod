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

<h1 class={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
	{@render children?.()}
</h1>
