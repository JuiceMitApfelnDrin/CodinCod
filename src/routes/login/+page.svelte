<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LoginForm from "@/features/authentication/login/components/login-form.svelte";
	import { frontendUrls } from "types";

	export let data;
</script>

<Container>
	<H1>Login</H1>

	<P>Log-in to enjoy CodinCod, or <a href={frontendUrls.REGISTER}>register here</a> instead!</P>

	<LoginForm data={data.form}></LoginForm>
</Container>
