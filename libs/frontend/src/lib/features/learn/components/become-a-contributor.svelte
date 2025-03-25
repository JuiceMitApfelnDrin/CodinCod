<script>
	import H2 from "@/components/typography/h2.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { githubRepo } from "types";
</script>

<section>
	<H2>Join the movement</H2>

	<p>
		If you see something that can be improved,
		<Button variant="secondary" href={`${githubRepo}/issues`}>open an issue</Button> or <Button
			href={githubRepo}
			variant="secondary">contribute on github</Button
		>.
	</p>
</section>
