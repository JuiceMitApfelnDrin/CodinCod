<script lang="ts">
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import type { WithElementRef, WithoutChildren } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> = $props();
</script>

<span
	bind:this={ref}
	role="presentation"
	aria-hidden="true"
	class={cn("flex size-9 items-center justify-center", className)}
	{...restProps}
>
	<Ellipsis class="size-4" />
	<span class="sr-only">More</span>
</span>
