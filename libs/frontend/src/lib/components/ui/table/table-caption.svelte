<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<caption
	bind:this={ref}
	class={cn("mt-4 text-sm text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</caption>
