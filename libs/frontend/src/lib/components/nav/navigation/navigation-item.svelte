<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { FrontendUrl } from "types";
	import type { Button as ButtonPrimitive } from "bits-ui";

	type $$Props = ButtonPrimitive.Props & { class?: string; href: FrontendUrl; text: string };
	let className: $$Props["class"] = undefined;

	export { className as class };
	export let href: FrontendUrl;
	export let text: string;
</script>

<li class={cn(className)}>
	<a
		{...$$restProps}
		class="hover:text-foreground dark:hover:text-foreground px-2 py-4 text-sm font-semibold uppercase text-teal-900 hover:underline dark:text-teal-100"
		{href}>{text}</a
	>
</li>
