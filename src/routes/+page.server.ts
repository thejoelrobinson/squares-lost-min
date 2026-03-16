import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getAllLessons, getProgressForUser } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.userId) throw redirect(303, '/onboarding');
	const [layoutData, lessons, progress] = await Promise.all([
		parent(),
		getAllLessons(),
		getProgressForUser(locals.userId)
	]);
	return { lessons, progress, user: layoutData.user };
};
