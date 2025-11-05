<script lang="ts">
	import SideNavigationItem from "@/components/nav/side-navigation/side-navigation-item.svelte";
	import SideNavigation from "@/components/nav/side-navigation/side-navigation.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Bell from "@lucide/svelte/icons/bell";
	import MessageCircle from "@lucide/svelte/icons/message-circle";
	import Paintbrush2 from "@lucide/svelte/icons/paintbrush-2";
	import Settings from "@lucide/svelte/icons/settings";
	import Settings2 from "@lucide/svelte/icons/settings-2";
	import User from "@lucide/svelte/icons/user";
	import type { Snippet } from "svelte";
	import { frontendUrls } from "$lib/types";

	let {
		children
	}: {
		children?: Snippet;
	} = $props();
</script>

<Container class="flex md:flex-row">
	<SideNavigation>
		<SideNavigationItem
			href={frontendUrls.SETTINGS_PROFILE}
			icon={User}
			text="Edit profile"
		/>
		<SideNavigationItem
			href={frontendUrls.SETTINGS_PREFERENCES}
			icon={Settings2}
			text="Preferences"
		/>
		<SideNavigationItem
			href={frontendUrls.SETTINGS_APPEARANCE}
			icon={Paintbrush2}
			text="Appearance"
		/>
		<SideNavigationItem
			href={frontendUrls.SETTINGS_COMMUNITY}
			icon={MessageCircle}
			text="Community"
		/>
		<SideNavigationItem
			href={frontendUrls.SETTINGS_NOTIFICATIONS}
			icon={Bell}
			text="Notifications"
		/>
		<SideNavigationItem
			href={frontendUrls.SETTINGS_ACCOUNT}
			icon={Settings}
			text="Account"
		/>
	</SideNavigation>

	<LogicalUnit>
		{@render children?.()}
	</LogicalUnit>
</Container>
