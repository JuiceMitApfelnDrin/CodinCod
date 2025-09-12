<script lang="ts">
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		"bg-card text-card-foreground rounded-lg border shadow-xs",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
