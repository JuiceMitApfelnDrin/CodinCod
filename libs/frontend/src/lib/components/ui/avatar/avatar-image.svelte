<script lang="ts">
	import { cn } from "@/utils/cn";
	import { Avatar as AvatarPrimitive } from "bits-ui";

	type $$Props = AvatarPrimitive.ImageProps;

	interface Props {
		class?: $$Props["class"];
		src?: $$Props["src"];
		alt?: $$Props["alt"];
		[key: string]: any
	}

	let { class: className = undefined, src = undefined, alt = undefined, ...rest }: Props = $props();
	
</script>

<AvatarPrimitive.Image
	{src}
	{alt}
	class={cn("aspect-square h-full w-full", className)}
	{...rest}
/>
