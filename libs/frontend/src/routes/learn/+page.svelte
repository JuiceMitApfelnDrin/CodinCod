<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
</script>

<Container>
	<H1>Hi there!</H1>

	<P>
		this will eventually show a bunch of resources, that are free and open-source, that people can
		use to learn new different languages (among others) at their own pace and time
	</P>
	<P>
		there should be a general language learning path with the basics e.g.: "if-else" ..., as well as
		language specific paths
	</P>
	<P>
		ideally, there are several levels of understanding, one that just says enough to get going with
		X (explained in a very rudimentary way, so anyone can understand), then another that goes a more
		in depth on how X works ...
		<br />
		<br />
		<br />
		So basically 3 levels, that expect a user to have a different understanding of the language, and
		each tailored to how much the person would like to know and understand
	</P>

	<ul>
		<li>where are we going to place the content?</li>
		<li>will we use html or markdown?</li>
		<li>
			if markdown:
			<ul>
				<li>
					take a look at <a href="https://github.com/remarkjs/remark">remark</a> or something similar
				</li>
				<li>
					and make sure to look at something that can generate table of contents, like: <a
						href="https://github.com/remarkjs/remark-toc">remark toc</a
					>
				</li>
			</ul>
		</li>
	</ul>
</Container>
