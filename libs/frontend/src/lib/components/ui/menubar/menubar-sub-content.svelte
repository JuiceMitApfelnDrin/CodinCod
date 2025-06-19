<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: MenubarPrimitive.SubContentProps = $props();
</script>

<MenubarPrimitive.SubContent
	bind:ref
	class={cn(
		"z-50 min-w-max rounded-md border bg-popover p-1 text-popover-foreground focus:outline-none",
		className
	)}
	{...restProps}
/>
