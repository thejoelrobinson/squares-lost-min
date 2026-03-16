import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getProgressForUser, getAllLessons } from '$lib/server/db/queries';
import { getLessonContent } from '$lib/content/lesson-data';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.userId) throw redirect(303, '/onboarding');

	const lessons = await getAllLessons();
	const progress = await getProgressForUser(locals.userId);

	// Build puzzle pieces data — only lessons with parts 2-10 have puzzle positions
	const pieces = lessons
		.filter((l) => l.partNumber >= 2)
		.map((lesson) => {
			const prog = progress.find((p) => p.lesson_progress.lessonId === lesson.id);
			const content = getLessonContent(lesson.slug);
			return {
				position: lesson.puzzlePosition,
				lessonTitle: lesson.title,
				earned: prog?.lesson_progress.puzzleEarned === true,
				partNumber: lesson.partNumber,
				coinImage: content?.coinImage
			};
		});

	const earnedCount = pieces.filter((p) => p.earned).length;

	return { pieces, earnedCount };
};
