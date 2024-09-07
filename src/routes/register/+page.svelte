<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import RegisterForm from "@/features/register/components/register-form.svelte";
	import P from "@/components/typography/p.svelte";
	import { frontendUrls } from "types";

	export let data;
</script>

<Container>
	<H1>Register</H1>

	<P>Welcome to CodinCod!<br />Let's begin the adventure</P>
	<P
		>Feel free to register and have fun :), or if you already have an account <a
			href={frontendUrls.LOGIN}>login here</a
		> instead!</P
	>

	<RegisterForm data={data.form}></RegisterForm>
</Container>
