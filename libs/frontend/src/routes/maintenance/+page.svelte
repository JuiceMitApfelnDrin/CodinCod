<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import { discordInviteUrl, githubRepo, twitchChannel } from "@/types/general";
</script>

<svelte:head>
	<title>CodinCod | Maintenance Mode</title>
	<meta http-equiv="refresh" content="15" />
	<meta
		name="description"
		content="CodinCod is currently undergoing maintenance. We'll be back shortly!"
	/>
</svelte:head>

<Container
	class="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
>
	<H1>Under Maintenance</H1>

	<P class="text-muted-foreground max-w-2xl text-xl">
		We're currently performing some updates to improve your experience. This
		usually only takes an instant (~10 seconds).
	</P>

	<P class="text-muted-foreground text-lg">
		The page will automatically refresh. Stay updated through our community
		channels:
	</P>

	<div class="flex flex-wrap items-center justify-center gap-4">
		<Button
			href={discordInviteUrl}
			target="_blank"
			rel="noopener noreferrer"
			size="lg"
			data-testid={testIds.MAINTENANCE_PAGE_BUTTON_DISCORD}
		>
			Discord
		</Button>

		<Button
			href={githubRepo}
			target="_blank"
			rel="noopener noreferrer"
			size="lg"
			variant="outline"
			data-testid={testIds.MAINTENANCE_PAGE_BUTTON_GITHUB}
		>
			GitHub
		</Button>

		<Button
			href={twitchChannel}
			target="_blank"
			rel="noopener noreferrer"
			size="lg"
			variant="outline"
			data-testid={testIds.MAINTENANCE_PAGE_BUTTON_TWITCH}
		>
			Twitch
		</Button>
	</div>

	<div class="text-muted-foreground mt-8 animate-pulse text-sm">
		Checking server status...
	</div>
</Container>
