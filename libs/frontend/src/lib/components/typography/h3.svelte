<script lang="ts">
	import { cn } from "@/utils/cn";

	type $$Props = { class?: string };

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<h3 class={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>
	<slot></slot>
</h3>
