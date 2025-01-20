<script lang="ts">
	import { cn } from "@/utils/cn";

	type $$Props = { class?: string };

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<h2
	class={cn(
		"scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
		className
	)}
>
	<slot></slot>
</h2>
