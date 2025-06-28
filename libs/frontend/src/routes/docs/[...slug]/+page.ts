import { error, type LoadEvent } from "@sveltejs/kit";
import type { ComponentType } from "svelte";

export async function load({ params }: LoadEvent) {
	const modules = import.meta.glob(`/src/lib/docs/**/*.md`);

	const slug = params.slug;

	if (!slug) {
		throw error(404);
	}

	for (const [path, resolver] of Object.entries(modules)) {
		const slugFromPath = path
			.replace("/src/lib/docs/", "")
			.replace(/\.md$/, "");

		if (slugFromPath === slug) {
			const docsPage = (await resolver?.()) as {
				default: ComponentType;
				metadata?: Record<string, string>;
			};

			if (!docsPage) {
				throw error(404);
			}

			return {
				content: docsPage.default,
				metadata: docsPage.metadata
			};
		}
	}

	throw error(404);
}
