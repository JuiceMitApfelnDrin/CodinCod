<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import RegisterForm from "@/features/authentication/register/components/register-form.svelte";
	import { frontendUrls } from "$lib/types";
	import * as Card from "@/components/ui/card";
	import type { ActionData, PageData } from "./$types";

	let {
		data,
		form
	}: {
		data: PageData;
		form: ActionData;
	} = $props();
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
				class="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs"
				href={frontendUrls.LOGIN}
			>
				Login
			</a>
			<Tabs.Trigger value="register">Register</Tabs.Trigger>

			<Tabs.Content value="register" class="col-span-2">
				<Card.Root class="w-full">
					<Card.Header>
						<H1>Register</H1>
						<Card.Description
							>Join CodinCod, the adventure awaits!</Card.Description
						>
					</Card.Header>

					<Card.Content>
						<RegisterForm message={form?.message} data={data.form}
						></RegisterForm>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.List>
	</Tabs.Root>
</Container>
