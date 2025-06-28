<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { children, class: className = undefined }: Props = $props();
</script>

<p
	class={cn(
		"leading-7 [&:not(:first-child)]:mt-2 lg:[&:not(:first-child)]:mt-4",
		className
	)}
>
	{@render children?.()}
</p>
