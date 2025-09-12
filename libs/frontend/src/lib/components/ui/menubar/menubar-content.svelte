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
			"bg-popover text-popover-foreground z-50 min-w-48 rounded-md border p-1 shadow-md focus:outline-hidden",
			className
		)}
		{...restProps}
	/>
</MenubarPrimitive.Portal>
