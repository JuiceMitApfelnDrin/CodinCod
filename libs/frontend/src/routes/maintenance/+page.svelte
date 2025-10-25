<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
</script>

<svelte:head>
	<title>CodinCod | Maintenance Mode</title>
	<meta http-equiv="refresh" content="15" />
	<meta
		name="description"
		content="CodinCod is currently undergoing maintenance. We'll be back shortly!"
	/>
</svelte:head>

<Container class="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
	<H1>Under Maintenance</H1>
	
	<P class="text-xl text-muted-foreground max-w-2xl">
		We're currently performing some updates to improve your experience.
		This usually only takes an instant (~10 seconds).
	</P>
	
	<P class="text-lg text-muted-foreground">
		The page will automatically refresh. If the issue persists, join our Discord for updates.
	</P>
	
	<Button
		href="https://discord.gg/n9Md43S8Yb"
		target="_blank"
		rel="noopener noreferrer"
		size="lg"
	>
		Join Discord
	</Button>
	
	<div class="mt-8 text-sm text-muted-foreground animate-pulse">
		Checking server status...
	</div>
</Container>
