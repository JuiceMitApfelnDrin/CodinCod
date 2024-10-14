<script lang="ts">
	import { cn } from "@/utils/cn";

	type $$Props = { class?: string };

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<p class={cn("leading-7 [&:not(:first-child)]:mt-2 lg:[&:not(:first-child)]:mt-4", className)}>
	<slot></slot>
</p>
