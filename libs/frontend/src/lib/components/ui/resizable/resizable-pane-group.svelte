<script lang="ts">
	import * as ResizablePrimitive from "paneforge";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		this: paneGroup = $bindable(),
		...restProps
	}: ResizablePrimitive.PaneGroupProps & {
		this?: ResizablePrimitive.PaneGroup;
	} = $props();
</script>

<ResizablePrimitive.PaneGroup
	bind:this={paneGroup}
	class={cn("flex h-full w-full data-[direction=vertical]:flex-col", className)}
	{...restProps}
/>
