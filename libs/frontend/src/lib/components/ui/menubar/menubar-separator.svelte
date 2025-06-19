<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: MenubarPrimitive.SeparatorProps = $props();
</script>

<MenubarPrimitive.Separator
	bind:ref
	class={cn("-mx-1 my-1 h-px bg-muted", className)}
	{...restProps}
/>
