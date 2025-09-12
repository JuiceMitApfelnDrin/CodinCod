<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: DropdownMenuPrimitive.SubContentProps = $props();
</script>

<DropdownMenuPrimitive.SubContent
	bind:ref
	class={cn(
		"bg-popover text-popover-foreground z-50 min-w-32 rounded-md border p-1 shadow-lg focus:outline-hidden",
		className
	)}
	{...restProps}
/>
