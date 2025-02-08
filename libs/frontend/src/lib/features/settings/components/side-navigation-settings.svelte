<script lang="ts">
	import { page } from "$app/stores";
	import { cn } from "@/utils/cn";
	import { Bell, MessageCircle, Paintbrush2, Settings, Settings2, User } from "lucide-svelte";
	import { frontendUrls, type FrontendLink } from "types";

	const profileSections: (FrontendLink & { icon?: any })[] = [
		{
			text: "Edit profile",
			href: frontendUrls.SETTINGS_PROFILE,
			icon: User
		},
		{
			text: "Preferences",
			href: frontendUrls.SETTINGS_PREFERENCES,
			icon: Settings2
		},
		{
			text: "Appearance",
			href: frontendUrls.SETTINGS_APPEARANCE,
			icon: Paintbrush2
		},
		{
			text: "Community",
			href: frontendUrls.SETTINGS_COMMUNITY,
			icon: MessageCircle
		},
		{
			text: "Notifications",
			href: frontendUrls.SETTINGS_NOTIFICATIONS,
			icon: Bell
		},
		{
			text: "Account",
			href: frontendUrls.SETTINGS_ACCOUNT,
			icon: Settings
		}
	];
</script>

<nav class="flex w-full flex-col gap-2 rounded-lg border p-4 md:max-w-64">
	{#each profileSections as { href, text, icon: Icon }}
		<a
			{href}
			class={cn(
				"relative",
				"block w-full rounded-md px-4 py-2 hover:bg-stone-700 hover:underline",
				$page.url.pathname === href &&
					"settings-link bg-stone-900 font-bold text-cyan-600 dark:text-cyan-300"
			)}
		>
			{#if Icon}
				<Icon class="mr-2 inline" size={16} aria-hidden="true" />
			{/if}
			<span>{text}</span>
		</a>
	{/each}
</nav>

<style lang="postcss">
	.settings-link::after {
		@apply absolute -left-2.5 top-0 h-full w-1.5 rounded-full bg-cyan-700 hover:bg-cyan-500;
		content: "";
	}
</style>
