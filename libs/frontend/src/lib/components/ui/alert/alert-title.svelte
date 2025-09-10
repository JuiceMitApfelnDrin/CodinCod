<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { HeadingLevel } from "./index.js";
	import { cn } from "@/utils/cn.js";
	import type { Snippet } from "svelte";

	type $$Props = HTMLAttributes<HTMLHeadingElement>;

	let {
		children,
		class: className = undefined,
		level = "h5",
		...rest
	}: {
		class?: $$Props["class"];
		level?: HeadingLevel;
		children?: Snippet;
	} = $props();
</script>

<svelte:element
	this={level}
	class={cn("mb-1 leading-none font-medium tracking-tight", className)}
	{...rest}
>
	{@render children?.()}
</svelte:element>
