<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	type $$Props = HTMLAttributes<HTMLDivElement>;
	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<h1 class={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
	<slot></slot>
</h1>
