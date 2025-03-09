import maintenanceHtml from './maintenance.html';
import { websiteUrl } from 'types';

export default {
	async fetch(request, env, ctx) {
		try {
			const mainResponse = await fetch(websiteUrl);

			if (mainResponse.ok) return fetch(request);
		} catch (e) {}

		return new Response(maintenanceHtml, {
			status: 503,
			headers: { 'Content-Type': 'text/html' },
		});
	},
} satisfies ExportedHandler<Env>;
