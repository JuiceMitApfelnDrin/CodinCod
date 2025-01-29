import { error, type LoadEvent } from "@sveltejs/kit";

export async function load({ params }: LoadEvent) {
	const slug = params.slug;

	try {
		const post = await import(`/src/content/learn/${slug}/README.md`);

		return { content: post.default, meta: post.metadata };
	} catch {
		error(404, `Could not find ${params.slug}`);
	}
}
