import maintenanceHtml from './maintenance.html';
import { websiteUrl } from 'types';

export default {
	async fetch(request) {
		try {
			const mainResponse = await fetch(websiteUrl);

			if (mainResponse.ok) return fetch(request);
		} catch {
			console.error('fetch went wrong');
		}

		return new Response(maintenanceHtml, {
			status: 503,
			headers: { 'Content-Type': 'text/html' },
		});
	},
} satisfies ExportedHandler<Env>;
