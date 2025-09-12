<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		align = "center",
		class: className,
		portalProps,
		ref = $bindable(null),
		sideOffset = 4,
		...restProps
	}: HoverCardPrimitive.ContentProps & {
		portalProps?: HoverCardPrimitive.PortalProps;
	} = $props();
</script>

<HoverCardPrimitive.Portal {...portalProps}>
	<HoverCardPrimitive.Content
		bind:ref
		{align}
		{sideOffset}
		class={cn(
			"bg-popover text-popover-foreground z-50 mt-3 w-64 rounded-md border p-4 shadow-md outline-hidden",
			className
		)}
		{...restProps}
	/>
</HoverCardPrimitive.Portal>
