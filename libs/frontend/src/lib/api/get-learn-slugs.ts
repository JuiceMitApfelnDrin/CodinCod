export async function getLearnSlugs() {
	const slugs = [];
	const paths = import.meta.glob("../../../../../docs/learn/**/README.md");

	for (const path in paths) {
		// remove ../../../../../docs/learn/
		const subPathWithoutLearn = path.split("/learn/")[1];
		// remove README.md
		const slug = subPathWithoutLearn.split("/").slice(0, -1).join("/");

		slugs.push(slug);
	}

	return slugs.sort((a: string, b: string) => a.localeCompare(b));
}
