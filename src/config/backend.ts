import { PUBLIC_BACKEND_URL } from '$env/static/public';

export const backend_urls = {
	login: 'user/login'
};

export function generateBackendUrl(url: string): string {
	console.log(PUBLIC_BACKEND_URL, 'hi');
	return PUBLIC_BACKEND_URL + url;
}
