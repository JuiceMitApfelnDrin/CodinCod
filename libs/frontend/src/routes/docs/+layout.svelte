<script>
	import SideNavigationGroup from "@/components/nav/side-navigation/side-navigation-group.svelte";
	import SideNavigationItem from "@/components/nav/side-navigation/side-navigation-item.svelte";
	import SideNavigation from "@/components/nav/side-navigation/side-navigation.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import BecomeAContributor from "@/features/learn/components/become-a-contributor.svelte";
	import { frontendUrls } from "types";
</script>

<Container class="flex md:flex-row">
	<SideNavigation>
		<SideNavigationItem href={frontendUrls.DOCS} text="General" />
		<SideNavigationGroup text="Profile">
			<SideNavigationItem href={frontendUrls.DOCS_ACTIVITY} text="Activity" />
		</SideNavigationGroup>
	</SideNavigation>

	<LogicalUnit class="prose prose-stone dark:prose-invert">
		<slot />

		<BecomeAContributor />
	</LogicalUnit>
</Container>
