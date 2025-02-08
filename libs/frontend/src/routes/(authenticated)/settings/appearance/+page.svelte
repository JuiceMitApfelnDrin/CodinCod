<script lang="ts">
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import SideNavigationSettings from "@/features/settings/components/side-navigation-settings.svelte";
</script>

<Container class="flex md:flex-row">
	<SideNavigationSettings />

	<LogicalUnit
		><WorkInProgress />, Eventually you'll be able to choose how your editor looks like, or which
		theme is default for your account, ...</LogicalUnit
	>
</Container>
