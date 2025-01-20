import { error, type LoadEvent } from "@sveltejs/kit";

export async function load({ params }: LoadEvent) {
	const slug = params.slug;

	try {
		const post = await import(`../../../../../../docs/learn/${slug}/README.md`);

		return { content: post.default, meta: post.metadata };
	} catch (e) {
		error(404, `Could not find ${params.slug}`);
	}
}
