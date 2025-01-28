import { type VariantProps, tv } from "tailwind-variants";
import Root from "./toggle.svelte";

export const toggleVariants = tv({
	base: "ring-offset-background hover:bg-muted hover:text-muted-foreground focus-visible:ring-ring data-[state=on]:bg-accent data-[state=on]:text-accent-foreground inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	defaultVariants: {
		size: "default",
		variant: "default"
	},
	variants: {
		size: {
			default: "h-10 px-3",
			lg: "h-11 px-5",
			sm: "h-9 px-2.5"
		},
		variant: {
			default: "bg-transparent",
			outline: "border-input hover:bg-accent hover:text-accent-foreground border bg-transparent"
		}
	}
});

export type Variant = VariantProps<typeof toggleVariants>["variant"];
export type Size = VariantProps<typeof toggleVariants>["size"];

export {
	Root,
	//
	Root as Toggle
};
