<script lang="ts">
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import type { WithElementRef } from "bits-ui";
	import type { HTMLLiAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li
	role="presentation"
	aria-hidden="true"
	class={cn("[&>svg]:size-3.5", className)}
	bind:this={ref}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<ChevronRight />
	{/if}
</li>
