import type { LayoutServerLoad } from './$types';
import { getUserById } from '$lib/server/db/queries';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.userId) return { user: null };
	const user = await getUserById(locals.userId);
	return { user: user ?? null };
};
