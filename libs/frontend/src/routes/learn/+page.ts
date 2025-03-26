export async function load() {
	const paths = import.meta.glob("/src/content/learn/**/README.md");

	const slugs = Object.keys(paths)
		.map((path) => path.replace("/src/content/learn/", "").replace(/\/README\.md$/, ""))
		.sort((a, b) => a.localeCompare(b));

	return {
		slugs
	};
}
