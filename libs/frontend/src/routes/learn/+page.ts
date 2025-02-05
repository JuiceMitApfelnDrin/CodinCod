import { getLearnSlugs } from "../api/get-learn-slugs";

export async function load() {
	const slugs = await getLearnSlugs();

	return {
		slugs: slugs
	};
}
