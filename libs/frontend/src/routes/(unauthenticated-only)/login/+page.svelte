<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import * as Card from "@/components/ui/card";
	import Container from "@/components/ui/container/container.svelte";
	import LoginForm from "@/features/authentication/login/components/login-form.svelte";
	import { frontendUrls } from "types";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;
</script>

<svelte:head>
	<title>Login | CodinCod</title>
	<meta
		name="description"
		content="Access your profile, join live battles, and continue mastering coding puzzles in our open-source community."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container class="items-center justify-center">
	<Card.Root class="my-4 w-full md:my-8 md:max-w-lg lg:my-12">
		<Card.Header>
			<H1>Login</H1>
			<Card.Description>Welcome, let's login and get playin'!</Card.Description>
		</Card.Header>

		<Card.Content>
			<LoginForm message={form?.message} data={data.form}></LoginForm>
		</Card.Content>

		<Card.Footer>
			<P><a href={frontendUrls.REGISTER}>Register</a></P>
		</Card.Footer>
	</Card.Root>
</Container>
