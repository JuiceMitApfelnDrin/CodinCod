export async function load() {
	const docsPage = await import("/src/lib/docs/README.md");

	return {
		content: docsPage.default,
		metadata: docsPage.metadata
	};
}
