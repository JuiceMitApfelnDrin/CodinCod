<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		inset = undefined,
		ref = $bindable(null),
		...restProps
	}: MenubarPrimitive.ItemProps & {
		inset?: boolean;
	} = $props();
</script>

<MenubarPrimitive.Item
	bind:ref
	class={cn(
		"data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50",
		inset && "pl-8",
		className
	)}
	{...restProps}
/>
