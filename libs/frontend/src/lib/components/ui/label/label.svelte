<script lang="ts">
	import { Label as LabelPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: LabelPrimitive.RootProps = $props();
</script>

<LabelPrimitive.Root
	bind:ref
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
	{...restProps}
/>
