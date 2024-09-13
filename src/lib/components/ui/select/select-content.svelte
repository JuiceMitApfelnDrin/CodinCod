<script lang="ts">
	import { cn } from "@/utils/cn";
	import { flyAndScale } from "@/utils/fly-and-scale";
	import { Select as SelectPrimitive } from "bits-ui";
	import { scale } from "svelte/transition";

	type $$Props = SelectPrimitive.ContentProps;
	type $$Events = SelectPrimitive.ContentEvents;

	export let sideOffset: $$Props["sideOffset"] = 4;
	export let inTransition: $$Props["inTransition"] = flyAndScale;
	export let inTransitionConfig: $$Props["inTransitionConfig"] = undefined;
	export let outTransition: $$Props["outTransition"] = scale;
	export let outTransitionConfig: $$Props["outTransitionConfig"] = {
		duration: 50,
		opacity: 0,
		start: 0.95
	};

	let className: $$Props["class"] = undefined;
	export { className as class };
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
	{...$$restProps}
	on:keydown
>
	<div class="w-full p-1">
		<slot />
	</div>
</SelectPrimitive.Content>
