<script lang="ts">
	import { cn } from "@/utils/cn";
	import { flyAndScale } from "@/utils/fly-and-scale";
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";

	type $$Props = HoverCardPrimitive.ContentProps;

	interface Props {
		class?: $$Props["class"];
		transition?: $$Props["transition"];
		transitionConfig?: $$Props["transitionConfig"];
		align?: $$Props["align"];
		sideOffset?: $$Props["sideOffset"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		transition = flyAndScale,
		transitionConfig = undefined,
		align = "center",
		sideOffset = 4,
		children,
		...rest
	}: Props = $props();
</script>

<HoverCardPrimitive.Content
	{transition}
	{transitionConfig}
	{align}
	{sideOffset}
	class={cn(
		"z-50 mt-3 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
		className
	)}
	{...rest}
>
	{@render children?.()}
</HoverCardPrimitive.Content>
