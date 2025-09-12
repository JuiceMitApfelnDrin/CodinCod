<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: SelectPrimitive.GroupHeadingProps = $props();
</script>

<SelectPrimitive.GroupHeading
	bind:ref
	class={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
	{...restProps}
/>
