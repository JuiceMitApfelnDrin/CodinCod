<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	type $$Props = HTMLInputAttributes;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<div
	class={cn(
		"container mx-auto flex max-w-screen-lg flex-col gap-4 py-4 md:gap-8 md:py-8 lg:gap-12 xl:py-12",
		className
	)}
>
	<slot />
</div>
