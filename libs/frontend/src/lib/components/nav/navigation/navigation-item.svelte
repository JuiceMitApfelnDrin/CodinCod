<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { FrontendUrl } from "$lib/types";
	import type { Button as ButtonPrimitive } from "bits-ui";
	import { type DataTestIdProp } from "$lib/types";

	type $$Props = ButtonPrimitive.RootProps & {
		class?: string;
		href: FrontendUrl;
		text: string;
	};

	let {
		class: className = undefined,
		href,
		text,
		...rest
	}: {
		class?: $$Props["class"];
		href: FrontendUrl;
		text: string;
	} & DataTestIdProp = $props();
</script>

<li class={cn(className)}>
	<a
		{...rest}
		class="hover:text-foreground dark:hover:text-foreground px-2 py-4 text-sm font-semibold text-teal-900 uppercase hover:underline dark:text-teal-100"
		{href}>{text}</a
	>
</li>
