<script lang="ts">
	import { cn } from "@/utils/cn";
	import { Tabs as TabsPrimitive } from "bits-ui";

	type $$Props = TabsPrimitive.ListProps;

	interface Props {
		class?: $$Props["class"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
</script>

<TabsPrimitive.List
	class={cn(
		"inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground",
		className
	)}
	{...rest}
>
	{@render children?.()}
</TabsPrimitive.List>
