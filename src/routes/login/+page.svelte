<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import LoginForm from "@/features/login/components/login-form.svelte";

	export let data;
</script>

<Container>
	<H1>Login</H1>

	<P>Get ready to enjoy CodinCod!</P>

	<LoginForm data={data.form}></LoginForm>
</Container>
