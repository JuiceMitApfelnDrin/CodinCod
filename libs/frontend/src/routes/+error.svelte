<script>
	import { page } from "$app/state";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import { testIds } from "@/config/test-ids";
	import { frontendUrls } from "types";
</script>

<Container>
	<H1>{page.status} - {page.error?.message || "Something broke."}</H1>

	<P
		>Go back to the <Button
			data-testid={testIds.ERROR_COMPONENT_ANCHOR_HOMEPAGE}
			variant="outline"
			href={frontendUrls.ROOT}>homepage</Button
		> .</P
	>
</Container>
