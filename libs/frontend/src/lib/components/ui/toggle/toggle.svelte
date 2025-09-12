<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants/lite";

	export const toggleVariants = tv({
		base: "ring-offset-background hover:bg-muted hover:text-muted-foreground focus-visible:ring-ring data-[state=on]:bg-accent data-[state=on]:text-accent-foreground inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
		defaultVariants: {
			size: "default",
			variant: "default"
		},
		variants: {
			size: {
				default: "h-10 min-w-10 px-3",
				lg: "h-11 min-w-11 px-5",
				sm: "h-9 min-w-9 px-2.5"
			},
			variant: {
				default: "bg-transparent",
				outline:
					"border-input hover:bg-accent hover:text-accent-foreground border bg-transparent"
			}
		}
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
	export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
	export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		class: className,
		pressed = $bindable(false),
		ref = $bindable(null),
		size = "default",
		variant = "default",
		...restProps
	}: TogglePrimitive.RootProps & {
		variant?: ToggleVariant;
		size?: ToggleSize;
	} = $props();
</script>

<TogglePrimitive.Root
	bind:ref
	bind:pressed
	class={cn(toggleVariants({ size, variant }), className)}
	{...restProps}
/>
