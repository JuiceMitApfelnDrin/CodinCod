<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { HeadingLevel } from "./index.js";
	import { cn } from "@/utils/cn.js";
	import type { Snippet } from "svelte";

	type $$Props = HTMLAttributes<HTMLHeadingElement> & {
		level?: HeadingLevel;
	};

	interface Props {
		class?: $$Props["class"];
		level?: $$Props["level"];
		children?: Snippet;
		[key: string]: any;
	}

	let { class: className = undefined, level = "h5", children, ...rest }: Props = $props();
</script>

<svelte:element
	this={level}
	class={cn("mb-1 font-medium leading-none tracking-tight", className)}
	{...rest}
>
	{@render children?.()}
</svelte:element>
