import { getLearnSlugs } from "@/api/get-learn-slugs";

export async function load({ params }) {
	const slugs = await getLearnSlugs();

	return {
		slugs: slugs
	};
}
