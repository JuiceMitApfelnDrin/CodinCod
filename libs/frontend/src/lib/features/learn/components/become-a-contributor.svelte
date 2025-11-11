<script>
	import H2 from "@/components/typography/h2.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import { githubRepo } from "@/types/general";
</script>

<section>
	<H2>Join the movement</H2>

	<P>
		If you see something that can be improved,
		<Button
			data-testid={testIds.BECOME_A_CONTRIBUTOR_COMPONENT_ANCHOR_OPEN_AN_ISSUE}
			variant="secondary"
			href={`${githubRepo}/issues`}
		>
			open an issue
		</Button> or <Button
			href={githubRepo}
			data-testid={testIds.BECOME_A_CONTRIBUTOR_COMPONENT_ANCHOR_GITHUB}
			variant="secondary"
		>
			contribute on github
		</Button>.
	</P>
</section>
