<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		inset,
		ref = $bindable(null),
		...restProps
	}: DropdownMenuPrimitive.GroupHeadingProps & {
		inset?: boolean;
	} = $props();
</script>

<DropdownMenuPrimitive.GroupHeading
	bind:ref
	class={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
	{...restProps}
/>
