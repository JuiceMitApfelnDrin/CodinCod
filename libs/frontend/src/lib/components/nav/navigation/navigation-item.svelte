<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { FrontendUrl } from "types";
	import type { Button as ButtonPrimitive } from "bits-ui";
	import { type DataTestIdProp } from "@/config/test-ids";

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
	} & DataTestIdProp = $props();
</script>

<li class={cn(className)}>
	<a
		{...rest}
		class="px-2 py-4 text-sm font-semibold uppercase text-teal-900 hover:text-foreground hover:underline dark:text-teal-100 dark:hover:text-foreground"
		{href}>{text}</a
	>
</li>
