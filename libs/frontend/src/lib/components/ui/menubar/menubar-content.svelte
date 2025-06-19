<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		align = "start",
		alignOffset = -4,
		class: className,
		portalProps,
		ref = $bindable(null),
		side = "bottom",
		sideOffset = 8,
		...restProps
	}: MenubarPrimitive.ContentProps & {
		portalProps?: MenubarPrimitive.PortalProps;
	} = $props();
</script>

<MenubarPrimitive.Portal {...portalProps}>
	<MenubarPrimitive.Content
		bind:ref
		{sideOffset}
		{align}
		{alignOffset}
		{side}
		class={cn(
			"z-50 min-w-[12rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none",
			className
		)}
		{...restProps}
	/>
</MenubarPrimitive.Portal>
