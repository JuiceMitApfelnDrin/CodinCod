<script lang="ts">
	import type { WithElementRef } from "bits-ui";
	import type { HTMLOlAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLOlAttributes> = $props();
</script>

<ol
	bind:this={ref}
	class={cn(
		"flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</ol>
