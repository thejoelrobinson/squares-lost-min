import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getAllLessons, getProgressForUser } from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.userId) throw redirect(303, '/onboarding');
	const lessons = await getAllLessons();
	const progress = await getProgressForUser(locals.userId);
	return { lessons, progress };
};
