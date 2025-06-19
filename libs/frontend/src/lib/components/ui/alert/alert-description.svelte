<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let {
		children,
		class: className = undefined,
		...rest
	}: {
		class?: $$Props["class"];
		children?: Snippet;
	} = $props();
</script>

<div class={cn("text-sm [&_p]:leading-relaxed", className)} {...rest}>
	{@render children?.()}
</div>
