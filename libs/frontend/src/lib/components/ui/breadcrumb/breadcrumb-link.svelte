<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	type $$Props = HTMLAnchorAttributes & {
		el?: HTMLAnchorElement;
		asChild?: boolean;
	};

	interface Props {
		href?: $$Props["href"];
		el?: $$Props["el"];
		asChild?: $$Props["asChild"];
		class?: $$Props["class"];
		children?: import('svelte').Snippet<[any]>;
		[key: string]: any
	}

	let {
		href = undefined,
		el = $bindable(undefined),
		asChild = false,
		class: className = undefined,
		children,
		...rest
	}: Props = $props();
	

	let attrs: Record<string, unknown> = $derived({
		class: cn("hover:text-foreground transition-colors", className),
		href,
		...rest
	});

	
</script>

{#if asChild}
	{@render children?.({ attrs, })}
{:else}
	<a bind:this={el} {...attrs} {href}>
		{@render children?.({ attrs, })}
	</a>
{/if}
