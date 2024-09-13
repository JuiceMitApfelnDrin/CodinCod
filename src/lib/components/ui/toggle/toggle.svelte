<script lang="ts">
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { type Size, type Variant, toggleVariants } from "./index.js";
	import { cn } from "@/utils/cn.js";

	type $$Props = TogglePrimitive.Props & {
		size?: Size;
		variant?: Variant;
	};
	type $$Events = TogglePrimitive.Events;

	let className: $$Props["class"] = undefined;
	export let variant: $$Props["variant"] = "default";
	export let size: $$Props["size"] = "default";
	export let pressed: $$Props["pressed"] = undefined;
	export { className as class };
</script>

<TogglePrimitive.Root
	bind:pressed
	class={cn(toggleVariants({ className, size, variant }))}
	{...$$restProps}
	on:click
>
	<slot />
</TogglePrimitive.Root>
