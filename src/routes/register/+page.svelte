<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import RegisterForm from "@/features/register/components/register-form.svelte";
	import P from "@/components/typography/p.svelte";

	export let data;
</script>

<Container>
	<H1>Register</H1>

	<P>Welcome to CodinCod!<br />Let's begin the adventure</P>

	<RegisterForm data={data.form}></RegisterForm>
</Container>
