<script lang="ts">
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	let {
		children,
		class: className,
		level = 3,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
	} = $props();
</script>

<div
	role="heading"
	aria-level={level}
	bind:this={ref}
	class={cn("text-2xl leading-none font-semibold tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</div>
