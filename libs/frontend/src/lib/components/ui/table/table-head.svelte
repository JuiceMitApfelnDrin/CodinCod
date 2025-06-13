<script lang="ts">
	import type { HTMLThAttributes } from "svelte/elements";

	import { cn } from "@/utils/cn";

	type $$Props = HTMLThAttributes;

	interface Props {
		class?: $$Props["class"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
</script>

<th
	class={cn(
		"h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
		className
	)}
	{...rest}
>
	{@render children?.()}
</th>
