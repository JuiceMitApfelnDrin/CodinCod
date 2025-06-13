<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLSpanElement> & {
		el?: HTMLSpanElement;
	};

	interface Props {
		el?: $$Props["el"];
		class?: $$Props["class"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let {
		el = $bindable(undefined),
		class: className = undefined,
		children,
		...rest
	}: Props = $props();
</script>

<span
	bind:this={el}
	role="link"
	aria-disabled="true"
	aria-current="page"
	class={cn("font-normal text-foreground", className)}
	{...rest}
>
	{@render children?.()}
</span>
