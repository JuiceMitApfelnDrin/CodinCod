<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	type $$Props = MenubarPrimitive.TriggerProps;
	type $$Events = MenubarPrimitive.TriggerEvents;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<MenubarPrimitive.Trigger
	class={cn(
		"flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none data-[highlighted]:bg-accent data-[state=open]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:text-accent-foreground",
		className
	)}
	on:click
	on:keydown
	on:pointerenter
	{...rest}
>
	{@render children?.()}
</MenubarPrimitive.Trigger>
