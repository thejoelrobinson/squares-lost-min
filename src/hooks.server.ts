import type { Handle } from '@sveltejs/kit';
import { getFirstUser } from '$lib/server/db/queries';

export const handle: Handle = async ({ event, resolve }) => {
	const user = await getFirstUser();
	event.locals.userId = user?.id ?? null;
	return resolve(event);
};
