<script lang="ts">
	import {
		Toaster as Sonner,
		type ToasterProps as SonnerProps
	} from "svelte-sonner";
	import { themeOption } from "types";
	import { isDarkTheme } from "@/stores/theme.store";

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={$isDarkTheme ? themeOption.DARK : themeOption.LIGHT}
	class="toaster group"
	toastOptions={{
		classes: {
			actionButton:
				"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton:
				"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
			description: "group-[.toast]:text-muted-foreground",
			toast:
				"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg"
		}
	}}
	{...restProps}
/>
