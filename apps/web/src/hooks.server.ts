import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Auth token from cookie
	const token = event.cookies.get('ensocial_token');

	if (token) {
		try {
			// TODO: Validate JWT against API and populate event.locals.user
			// const user = await validateToken(token);
			// event.locals.user = user;
			// event.locals.session = { token };
			event.locals.user = null;
			event.locals.session = null;
		} catch {
			event.locals.user = null;
			event.locals.session = null;
			event.cookies.delete('ensocial_token', { path: '/' });
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
