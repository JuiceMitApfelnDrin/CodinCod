<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";

	type $$Props = HTMLInputAttributes;

	interface Props {
		class?: $$Props["class"];
		children?: Snippet;
	}

	let { children, class: className = undefined }: Props = $props();
</script>

<div
	class={cn(
		"container mx-auto flex flex-col gap-4 py-4 md:gap-8 md:py-8 lg:gap-12 xl:py-12",
		className
	)}
>
	{@render children?.()}
</div>
