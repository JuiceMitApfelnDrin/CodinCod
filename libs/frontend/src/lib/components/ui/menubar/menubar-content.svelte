<script lang="ts">
	import { cn } from "@/utils/cn";
	import { flyAndScale } from "@/utils/fly-and-scale";
	import { Menubar as MenubarPrimitive } from "bits-ui";

	type $$Props = MenubarPrimitive.ContentProps;
	type $$Events = MenubarPrimitive.ContentEvents;

	interface Props {
		class?: $$Props["class"];
		sideOffset?: $$Props["sideOffset"];
		alignOffset?: $$Props["alignOffset"];
		align?: $$Props["align"];
		side?: $$Props["side"];
		transition?: $$Props["transition"];
		transitionConfig?: $$Props["transitionConfig"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		sideOffset = 8,
		alignOffset = -4,
		align = "start",
		side = "bottom",
		transition = flyAndScale,
		transitionConfig = undefined,
		children,
		...rest
	}: Props = $props();
</script>

<MenubarPrimitive.Content
	{transition}
	{transitionConfig}
	{sideOffset}
	{align}
	{alignOffset}
	{side}
	class={cn(
		"z-50 min-w-[12rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none",
		className
	)}
	{...rest}
	on:keydown
>
	{@render children?.()}
</MenubarPrimitive.Content>
