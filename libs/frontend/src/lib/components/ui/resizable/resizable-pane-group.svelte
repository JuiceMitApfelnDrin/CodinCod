<script lang="ts">
	import { cn } from "@/utils/cn";
	import * as ResizablePrimitive from "paneforge";

	type $$Props = ResizablePrimitive.PaneGroupProps;

	interface Props {
		class?: $$Props["class"];
		direction: $$Props["direction"];
		paneGroup?: $$Props["paneGroup"];
		el?: $$Props["el"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		direction,
		paneGroup = $bindable(undefined),
		el = $bindable(undefined),
		children,
		...rest
	}: Props = $props();
	
</script>

<ResizablePrimitive.PaneGroup
	bind:el
	bind:paneGroup
	{direction}
	class={cn("flex h-full w-full data-[direction=vertical]:flex-col", className)}
	{...rest}
>
	{@render children?.()}
</ResizablePrimitive.PaneGroup>
