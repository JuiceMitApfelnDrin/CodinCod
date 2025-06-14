<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className = undefined, children }: Props = $props();
</script>

<h2
	class={cn(
		"scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
		className
	)}
>
	{@render children?.()}
</h2>
