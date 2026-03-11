import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import {
	getLessonBySlug,
	getUserById,
	getProgressForUser
} from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.userId) throw redirect(303, '/onboarding');

	const lesson = await getLessonBySlug(params.slug);
	if (!lesson) throw error(404, 'Lesson not found');

	const user = await getUserById(locals.userId);
	if (!user) throw redirect(303, '/onboarding');

	// Find this lesson's progress
	const allProgress = await getProgressForUser(locals.userId);
	const progress = allProgress.find((p) => p.lesson_progress.lessonId === lesson.id);

	if (!progress || progress.lesson_progress.status === 'locked') {
		throw redirect(303, '/');
	}

	return {
		lesson,
		user,
		progress: progress.lesson_progress,
		allProgress
	};
};
