import { error, type LoadEvent } from "@sveltejs/kit";
import type { ComponentType } from "svelte";

export async function load({ params }: LoadEvent) {
	const modules = import.meta.glob("/src/content/learn/**/README.md");

	const slug = params.slug;

	if (!slug) {
		throw error(404);
	}

	for (const [path, resolver] of Object.entries(modules)) {
		const slugFromPath = path.replace("/src/content/learn/", "").replace("/README.md", "");

		if (slugFromPath === slug) {
			const learnPage = (await resolver?.()) as {
				default: ComponentType;
				metadata?: Record<string, string>;
			};

			if (!learnPage) {
				throw error(404);
			}

			return {
				content: learnPage.default,
				metadata: learnPage.metadata
			};
		}
	}

	throw error(404);
}
