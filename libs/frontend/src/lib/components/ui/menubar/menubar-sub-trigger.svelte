<script lang="ts">
	import { Menubar as MenubarPrimitive, type WithoutChild } from "bits-ui";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import { cn } from "@/utils/cn";

	let {
		children,
		class: className,
		inset = undefined,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<MenubarPrimitive.SubTriggerProps> & {
		inset?: boolean;
	} = $props();
</script>

<MenubarPrimitive.SubTrigger
	bind:ref
	class={cn(
		"flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[state=open]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:text-accent-foreground data-[disabled]:opacity-50",
		inset && "pl-8",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronRight class="ml-auto size-4" />
</MenubarPrimitive.SubTrigger>
