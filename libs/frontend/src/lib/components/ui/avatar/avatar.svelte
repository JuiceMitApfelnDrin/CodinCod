<script lang="ts">
	import { cn } from "@/utils/cn";
	import { Avatar as AvatarPrimitive } from "bits-ui";

	type $$Props = AvatarPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		delayMs?: $$Props["delayMs"];
		children?: import("svelte").Snippet;
		[key: string]: any;
	}

	let { class: className = undefined, delayMs = undefined, children, ...rest }: Props = $props();
</script>

<AvatarPrimitive.Root
	delayMs={delayMs ?? 0}
	class={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
	{...rest}
>
	{@render children?.()}
</AvatarPrimitive.Root>
