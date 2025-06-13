<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLElement> & {
		el?: HTMLElement;
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

<nav class={className} bind:this={el} aria-label="breadcrumb" {...rest}>
	{@render children?.()}
</nav>
