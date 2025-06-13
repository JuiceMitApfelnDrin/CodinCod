<script lang="ts">
	import Ellipsis from "lucide-svelte/icons/ellipsis";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	type $$Props = HTMLAttributes<HTMLSpanElement> & {
		el?: HTMLSpanElement;
	};

	interface Props {
		el?: $$Props["el"];
		class?: $$Props["class"];
		[key: string]: any;
	}

	let { el = $bindable(undefined), class: className = undefined, ...rest }: Props = $props();
</script>

<span
	bind:this={el}
	role="presentation"
	aria-hidden="true"
	class={cn("flex h-9 w-9 items-center justify-center", className)}
	{...rest}
>
	<Ellipsis class="h-4 w-4" />
	<span class="sr-only">More</span>
</span>
