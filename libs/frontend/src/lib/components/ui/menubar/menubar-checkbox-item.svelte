<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import Check from "lucide-svelte/icons/check";
	import { cn } from "@/utils/cn";

	type $$Props = MenubarPrimitive.CheckboxItemProps;
	type $$Events = MenubarPrimitive.CheckboxItemEvents;

	interface Props {
		class?: $$Props["class"];
		checked?: $$Props["checked"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		checked = $bindable(false),
		children,
		...rest
	}: Props = $props();
</script>

<MenubarPrimitive.CheckboxItem
	bind:checked
	class={cn(
		"relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
		className
	)}
	on:click
	on:keydown
	on:focusin
	on:focusout
	on:pointerleave
	on:pointermove
	on:pointerdown
	{...rest}
>
	<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
		<MenubarPrimitive.CheckboxIndicator>
			<Check class="h-4 w-4" />
		</MenubarPrimitive.CheckboxIndicator>
	</span>
	{@render children?.()}
</MenubarPrimitive.CheckboxItem>
