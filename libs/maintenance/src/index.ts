import maintenanceHtml from './maintenance.html';
import { websiteUrl } from 'types';

export default {
	async fetch(request, env, ctx) {
		// Avoid loop: if header set, fetch main page normally.
		if (request.headers.get('x-skip-check')) {
			return fetch(request);
		}

		try {
			const mainResponse = await fetch(
				new Request(websiteUrl, {
					headers: { 'x-skip-check': 'true' },
				}),
			);

			if (mainResponse.ok) return mainResponse;
		} catch (e) {}

		return new Response(maintenanceHtml, {
			status: 503,
			headers: { 'Content-Type': 'text/html' },
		});
	},
} satisfies ExportedHandler<Env>;
