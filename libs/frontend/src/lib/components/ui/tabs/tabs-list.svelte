<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let { class: className, ref = $bindable(null), ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	class={cn(
		"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
		className
	)}
	{...restProps}
/>
