<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import type { WithoutChild } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<FormPrimitive.LegendProps> = $props();
</script>

<FormPrimitive.Legend
	bind:ref
	class={cn(
		"data-fs-error:text-destructive text-sm leading-none font-medium",
		className
	)}
	{...restProps}
/>
