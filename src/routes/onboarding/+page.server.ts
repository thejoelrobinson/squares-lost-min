import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {
	createUser,
	updateUser,
	getUserById,
	getAllLessons,
	createLessonProgress,
	getProgressForUser
} from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ locals }) => {
	let existingUser = null;
	if (locals.userId) {
		existingUser = await getUserById(locals.userId);
	}
	return { existingUser };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const role = formData.get('role') as string;
		const teamSize = parseInt(formData.get('teamSize') as string) || 1;
		const feedbackFrequency = formData.get('feedbackFrequency') as string;
		const comfortLevel = parseInt(formData.get('comfortLevel') as string) || 3;
		const challenges = formData.getAll('challenges') as string[];
		const scenario = (formData.get('scenario') as string) || null;

		const userData = {
			name: firstName,
			lastName,
			role,
			teamSize,
			feedbackFrequency,
			comfortLevel,
			challenges: JSON.stringify(challenges),
			scenario
		};

		// Existing user: update profile and redirect
		if (locals.userId) {
			await updateUser(locals.userId, userData);
			const existingProgress = await getProgressForUser(locals.userId);
			if (existingProgress.length > 0) {
				throw redirect(303, '/');
			}
		}

		// New user: create and initialize progress
		const user = locals.userId
			? (await getUserById(locals.userId))!
			: await createUser(userData);

		const lessons = await getAllLessons();
		for (const lesson of lessons) {
			if (lesson.partNumber === 1) {
				await createLessonProgress({
					userId: user.id,
					lessonId: lesson.id,
					status: 'complete',
					puzzleEarned: false
				});
			} else if (lesson.partNumber === 2) {
				await createLessonProgress({
					userId: user.id,
					lessonId: lesson.id,
					status: 'available'
				});
			} else {
				await createLessonProgress({
					userId: user.id,
					lessonId: lesson.id,
					status: 'locked'
				});
			}
		}

		throw redirect(303, '/');
	}
};
