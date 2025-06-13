<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	type $$Props = HTMLLiAttributes & {
		el?: HTMLLIElement;
	};

	interface Props {
		el?: $$Props["el"];
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
	}

	let { el = $bindable(undefined), class: className = undefined, children }: Props = $props();
	
</script>

<li bind:this={el} class={cn("inline-flex items-center gap-1.5", className)}>
	{@render children?.()}
</li>
