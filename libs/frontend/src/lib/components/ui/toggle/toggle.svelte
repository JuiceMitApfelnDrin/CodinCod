<script lang="ts">
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { type Size, type Variant, toggleVariants } from "./index.js";
	import { cn } from "@/utils/cn.js";

	type $$Props = TogglePrimitive.Props & {
		size?: Size;
		variant?: Variant;
	};
	type $$Events = TogglePrimitive.Events;

	interface Props {
		class?: $$Props["class"];
		variant?: $$Props["variant"];
		size?: $$Props["size"];
		pressed?: $$Props["pressed"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		variant = "default",
		size = "default",
		pressed = $bindable(undefined),
		children,
		...rest
	}: Props = $props();
</script>

<TogglePrimitive.Root
	bind:pressed
	class={cn(toggleVariants({ className, size, variant }))}
	{...rest}
	on:click
>
	{@render children?.()}
</TogglePrimitive.Root>
