<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { FrontendUrl } from "types";
	import type { Button as ButtonPrimitive } from "bits-ui";

	type $$Props = ButtonPrimitive.RootProps & { class?: string; href: FrontendUrl; text: string };

	let {
		class: className = undefined,
		href,
		text,
		...rest
	}: {
		class?: $$Props["class"];
		href: FrontendUrl;
		text: string;
		[key: string]: any;
	} = $props();
</script>

<li class={cn(className)}>
	<a
		{...rest}
		class="hover:text-foreground dark:hover:text-foreground px-2 py-4 text-sm font-semibold uppercase text-teal-900 hover:underline dark:text-teal-100"
		{href}>{text}</a
	>
</li>
