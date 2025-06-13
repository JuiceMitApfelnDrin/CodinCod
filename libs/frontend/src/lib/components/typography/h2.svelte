<script lang="ts">
	import { cn } from "@/utils/cn";

	

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class = undefined, children }: Props = $props();
	
</script>

<h2
	class={cn(
		"scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
		className
	)}
>
	{@render children?.()}
</h2>
