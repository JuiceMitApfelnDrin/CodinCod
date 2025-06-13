<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import H1 from "@/components/typography/h1.svelte";
	import * as Card from "@/components/ui/card";
	import Container from "@/components/ui/container/container.svelte";
	import LoginForm from "@/features/authentication/login/components/login-form.svelte";
	import { frontendUrls } from "types";
	import type { ActionData, PageData } from "./$types";

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Login | CodinCod</title>
	<meta
		name="description"
		content="Access your profile, join live battles, and continue mastering coding puzzles in our open-source community."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container class="items-center justify-center py-4 md:py-8 lg:py-12">
	<Tabs.Root value="login" class="w-96">
		<Tabs.List class="grid w-full grid-cols-2 gap-2">
			<Tabs.Trigger value="login">Login</Tabs.Trigger>
			<a
				class="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
				href={frontendUrls.REGISTER}
			>
				Register
			</a>

			<Tabs.Content value="login" class="col-span-2">
				<Card.Root class="w-full">
					<Card.Header>
						<H1>Login</H1>
						<Card.Description>Welcome, let's login and get playin'!</Card.Description>
					</Card.Header>

					<Card.Content>
						<LoginForm message={form?.message} data={data.form}></LoginForm>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.List>
	</Tabs.Root>
</Container>
