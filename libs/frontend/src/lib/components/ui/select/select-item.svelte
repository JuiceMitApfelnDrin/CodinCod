<script lang="ts">
	import Check from "@lucide/svelte/icons/check";
	import { Select as SelectPrimitive, type WithoutChild } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		children: childrenProp,
		class: className,
		label,
		ref = $bindable(null),
		value,
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	{value}
	class={cn(
		"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
		className
	)}
	{...restProps}
>
	{#snippet children({ highlighted, selected })}
		<span class="absolute left-2 flex size-3.5 items-center justify-center">
			{#if selected}
				<Check class="size-4" />
			{/if}
		</span>
		{#if childrenProp}
			{@render childrenProp({ highlighted, selected })}
		{:else}
			{label || value}
		{/if}
	{/snippet}
</SelectPrimitive.Item>
