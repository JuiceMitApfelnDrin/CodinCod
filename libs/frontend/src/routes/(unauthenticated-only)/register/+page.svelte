<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import RegisterForm from "@/features/authentication/register/components/register-form.svelte";
	import P from "@/components/typography/p.svelte";
	import { frontendUrls, websiteName } from "types";
	import * as Card from "@/components/ui/card";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;
</script>

<Container class="items-center justify-center">
	<Card.Root class="my-4 w-full md:my-8 md:max-w-lg lg:my-12">
		<Card.Header>
			<H1>Register</H1>
			<Card.Description>Welcome to {websiteName}, the adventure awaits!</Card.Description>
		</Card.Header>

		<Card.Content>
			<RegisterForm message={form?.message} data={data.form}></RegisterForm>
		</Card.Content>

		<Card.Footer>
			<P><a href={frontendUrls.LOGIN}>Login</a></P>
		</Card.Footer>
	</Card.Root>
</Container>
