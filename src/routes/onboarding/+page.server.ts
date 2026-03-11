import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {
	createUser,
	getAllLessons,
	createLessonProgress
} from '$lib/server/db/queries';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to home if user already exists
	if (locals.userId) throw redirect(303, '/');
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Extract all fields from the multi-step form
		const name = formData.get('name') as string;
		const role = formData.get('role') as string;
		const teamSize = parseInt(formData.get('teamSize') as string) || 1;
		const feedbackFrequency = formData.get('feedbackFrequency') as string;
		const comfortLevel = parseInt(formData.get('comfortLevel') as string) || 3;
		const challenges = formData.getAll('challenges') as string[];
		const scenario = (formData.get('scenario') as string) || null;

		// Create the user
		const user = await createUser({
			name,
			role,
			teamSize,
			feedbackFrequency,
			comfortLevel,
			challenges: JSON.stringify(challenges),
			scenario
		});

		// Get all lessons and create initial progress
		const lessons = await getAllLessons();
		for (const lesson of lessons) {
			if (lesson.partNumber === 1) {
				// Onboarding is now complete
				await createLessonProgress({
					userId: user.id,
					lessonId: lesson.id,
					status: 'complete',
					puzzleEarned: false
				});
			} else if (lesson.partNumber === 2) {
				// First real lesson is available
				await createLessonProgress({
					userId: user.id,
					lessonId: lesson.id,
					status: 'available'
				});
			} else {
				// Rest are locked
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
