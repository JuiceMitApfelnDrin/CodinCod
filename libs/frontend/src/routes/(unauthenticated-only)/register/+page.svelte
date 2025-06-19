<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import RegisterForm from "@/features/authentication/register/components/register-form.svelte";
	import { frontendUrls } from "types";
	import * as Card from "@/components/ui/card";
	import type { ActionData, PageData } from "./$types";

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Register | CodinCod</title>
	<meta
		name="description"
		content="Create your free account to start competing in real-time coding puzzles, track your rank, and contribute to open-source challenges."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container class="items-center justify-center py-4 md:py-8 lg:py-12">
	<Tabs.Root value="register" class="w-96">
		<Tabs.List class="grid w-full grid-cols-2 gap-2">
			<a
				class="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
				href={frontendUrls.LOGIN}
			>
				Login
			</a>
			<Tabs.Trigger value="register">Register</Tabs.Trigger>

			<Tabs.Content value="register" class="col-span-2">
				<Card.Root class="w-full">
					<Card.Header>
						<H1>Register</H1>
						<Card.Description>Join CodinCod, the adventure awaits!</Card.Description>
					</Card.Header>

					<Card.Content>
						<RegisterForm message={form?.message} data={data.form}></RegisterForm>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.List>
	</Tabs.Root>
</Container>
