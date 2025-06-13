<script lang="ts">
	import { cn } from "@/utils/cn";

	

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class = undefined, children }: Props = $props();
	
</script>

<h3 class={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>
	{@render children?.()}
</h3>
