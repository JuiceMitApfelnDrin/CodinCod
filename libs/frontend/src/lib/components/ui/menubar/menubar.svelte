<script lang="ts">
	import { cn } from "@/utils/cn";
	import { Menubar as MenubarPrimitive } from "bits-ui";

	type $$Props = MenubarPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<MenubarPrimitive.Root
	class={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
	{...rest}
>
	{@render children?.()}
</MenubarPrimitive.Root>
