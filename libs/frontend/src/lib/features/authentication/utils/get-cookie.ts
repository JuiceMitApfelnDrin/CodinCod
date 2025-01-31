export function getCookie(name: string) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);

	if (parts.length === 2) {
		const cookieInfo = parts.pop();
		return cookieInfo?.split(";").shift();
	}
}
