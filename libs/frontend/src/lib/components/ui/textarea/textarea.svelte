<script lang="ts">
	import type { WithElementRef, WithoutChildren } from "bits-ui";
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";
	import type { DataTestIdProp } from "types";

	let {
		class: className,
		"data-testid": testId,
		ref = $bindable(null),
		value = $bindable(),
		...restProps
	}: WithoutChildren<
		WithElementRef<Omit<HTMLTextareaAttributes, "data-testid"> & DataTestIdProp>
	> = $props();
</script>

<textarea
	bind:this={ref}
	class={cn(
		"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
		className
	)}
	data-testid={testId}
	bind:value
	{...restProps}
></textarea>
