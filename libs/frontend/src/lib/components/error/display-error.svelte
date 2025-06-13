<script lang="ts">
	import { frontendUrls, type FrontendLink } from "types";
	import Container from "../ui/container/container.svelte";
	import * as Card from "../ui/card";
	import H1 from "../typography/h1.svelte";
	import P from "../typography/p.svelte";
	import Button from "../ui/button/button.svelte";

	interface Props {
		status?: number;
		message?: string | null;
		header?: string | null;
		link?: FrontendLink;
	}

	let {
		status = 500,
		message = null,
		header = null,
		link = {
		href: frontendUrls.ROOT,
		text: "Go to Homepage"
	}
	}: Props = $props();

	type ErrorTypeDefaultInfo = { header: string; description: string };
	const errorMap: Record<number, ErrorTypeDefaultInfo> = {
		401: { description: "You are not welcome here. You shall not pass!", header: "Unauthorized" },
		403: { description: "You don't have permission to access this page.", header: "Forbidden" },
		404: { description: "The page you are looking for does not exist.", header: "Page Not Found" },
		500: {
			description: "An unexpected error occurred on the server.",
			header: "Internal Server Error"
		}
	};

	// Fallback for unknown status codes
	const defaultError = { description: "An unexpected error occurred.", header: "Unknown Error" };

	const errorInfo = errorMap[status] ?? defaultError;
</script>

<Container>
	<Card.Root class="mx-auto mt-4 md:mt-8 md:max-w-lg">
		<Card.Header>
			<H1>
				{status} - {header ?? errorInfo.header}
			</H1>
		</Card.Header>
		<Card.Content>
			<P class="text-lg">{message ?? errorInfo.description}</P>
		</Card.Content>

		<Card.Footer>
			<Button href={link.href} class="mt-4">{link.text}</Button>
		</Card.Footer>
	</Card.Root>
</Container>
