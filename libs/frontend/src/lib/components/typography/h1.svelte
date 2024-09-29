<script lang="ts">
	import { cn } from "@/utils/cn";

	type $$Props = { class?: string };

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<h1 class={cn("scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
	<slot></slot>
</h1>
