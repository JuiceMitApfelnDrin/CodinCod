export const handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	console.log(event.locals.user, localStorage.length, localStorage);
	if (event.locals.user) {
		localStorage.setItem("email", event.locals.user.email);
		localStorage.setItem("id", event.locals.user.id);
		localStorage.setItem("isAuthenticated", event.locals.user.isAuthenticated);
	} else {
		localStorage.setItem("isAuthenticated", "false");
		localStorage.removeItem("id");
		localStorage.removeItem("email");
	}

	return response;
};
