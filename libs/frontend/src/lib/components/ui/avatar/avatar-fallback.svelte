<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
	bind:ref
	class={cn("flex size-full items-center justify-center", className)}
	{...restProps}
>
	<!-- smiley svg from svgrepo.com by AUTHOR brankic1979 as fallback -->
	<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
	<svg fill="#000000" viewBox="0 0 32 32" class="dark:invert">
		<path
			d="M16 4c-6.628 0-12 5.373-12 12s5.372 12 12 12c6.627 0 12-5.373 12-12s-5.373-12-12-12zM20 9.812c0.828 0 1.5 0.896 1.5 2s-0.672 2-1.5 2-1.5-0.896-1.5-2 0.672-2 1.5-2zM11.925 9.825c0.828 0 1.5 0.896 1.5 2s-0.672 2-1.5 2-1.5-0.896-1.5-2 0.672-2 1.5-2zM15.875 23.312c-4.105 0-6.857-2.687-7.352-7.156h0.969c0.785 3.458 2.91 5.188 6.375 5.188s5.59-1.729 6.375-5.188h1c-0.494 4.47-3.262 7.156-7.367 7.156z"
		></path>
	</svg>
</AvatarPrimitive.Fallback>
