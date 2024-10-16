<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import * as Card from "@/components/ui/card";
	import Container from "@/components/ui/container/container.svelte";
	import LoginForm from "@/features/authentication/login/components/login-form.svelte";
	import { frontendUrls } from "types";

	export let data;
	const { form: formData } = data;
</script>

<Container class="items-center justify-center">
	<Card.Root class="my-4 w-full md:my-8 md:max-w-lg lg:my-12">
		<Card.Header>
			<H1>Login</H1>
			<Card.Description>Welcome, let's login and get playin'!</Card.Description>
		</Card.Header>

		<Card.Content>
			<LoginForm data={formData}></LoginForm>
		</Card.Content>

		<Card.Footer>
			<P><a href={frontendUrls.REGISTER}>Register</a></P>
		</Card.Footer>
	</Card.Root>
</Container>
