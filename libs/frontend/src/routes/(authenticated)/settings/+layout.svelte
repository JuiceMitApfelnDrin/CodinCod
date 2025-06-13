<script lang="ts">
	import SideNavigationItem from "@/components/nav/side-navigation/side-navigation-item.svelte";
	import SideNavigation from "@/components/nav/side-navigation/side-navigation.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";

	import { Bell, MessageCircle, Paintbrush2, Settings, Settings2, User } from "lucide-svelte";
	import { frontendUrls } from "types";
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Container class="flex md:flex-row">
	<SideNavigation>
		<SideNavigationItem href={frontendUrls.SETTINGS_PROFILE} icon={User} text="Edit profile" />
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
		<SideNavigationItem href={frontendUrls.SETTINGS_ACCOUNT} icon={Settings} text="Account" />
	</SideNavigation>

	<LogicalUnit>
		{@render children?.()}
	</LogicalUnit>
</Container>
