<script lang="ts">
	import { isDarkTheme } from "@/stores";
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { themeOption } from "types";

	type $$Props = SonnerProps;
</script>

<Sonner
	theme={isDarkTheme ? themeOption.DARK : themeOption.LIGHT}
	class="toaster group"
	toastOptions={{
		classes: {
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
			description: "group-[.toast]:text-muted-foreground",
			toast:
				"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg"
		}
	}}
	{...$$restProps}
/>
