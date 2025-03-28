<script lang="ts">
	import { cn } from "@/utils/cn";
	import { Tabs as TabsPrimitive } from "bits-ui";

	type $$Props = TabsPrimitive.ListProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<TabsPrimitive.List
	class={cn(
		"inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground",
		className
	)}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.List>
