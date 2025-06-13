<script lang="ts">
	import { cn } from "@/utils/cn";
	import { flyAndScale } from "@/utils/fly-and-scale";
	import { Select as SelectPrimitive } from "bits-ui";
	import { scale } from "svelte/transition";

	type $$Props = SelectPrimitive.ContentProps;
	type $$Events = SelectPrimitive.ContentEvents;


	interface Props {
		sideOffset?: $$Props["sideOffset"];
		inTransition?: $$Props["inTransition"];
		inTransitionConfig?: $$Props["inTransitionConfig"];
		outTransition?: $$Props["outTransition"];
		outTransitionConfig?: $$Props["outTransitionConfig"];
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		sideOffset = 4,
		inTransition = flyAndScale,
		inTransitionConfig = undefined,
		outTransition = scale,
		outTransitionConfig = {
		duration: 50,
		opacity: 0,
		start: 0.95
	},
		class: className = undefined,
		children,
		...rest
	}: Props = $props();
	
</script>

<SelectPrimitive.Content
	{inTransition}
	{inTransitionConfig}
	{outTransition}
	{outTransitionConfig}
	{sideOffset}
	class={cn(
		"relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
		className
	)}
	{...rest}
	on:keydown
>
	<div class="w-full p-1">
		{@render children?.()}
	</div>
</SelectPrimitive.Content>
