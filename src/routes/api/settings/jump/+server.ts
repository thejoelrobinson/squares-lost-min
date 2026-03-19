import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lessonProgress } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getProgressForUser, getAllLessons } from '$lib/server/db/queries';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const { partNumber } = await request.json();
	if (typeof partNumber !== 'number' || partNumber < 1) {
		error(400, 'Invalid partNumber');
	}

	const allLessons = await getAllLessons();
	const targetLesson = allLessons.find((l) => l.partNumber === partNumber);
	if (!targetLesson) {
		error(404, 'Lesson not found');
	}

	const progress = await getProgressForUser(locals.userId);

	// Mark all lessons before target as complete (with puzzle earned if they have a puzzle position)
	// Mark the target lesson as available
	// Mark all lessons after target as locked
	for (const row of progress) {
		const lesson = allLessons.find((l) => l.id === row.lesson_progress.lessonId);
		if (!lesson) continue;

		let newStatus: string;
		let puzzleEarned = false;

		if (lesson.partNumber < partNumber) {
			newStatus = 'complete';
			puzzleEarned = !!lesson.puzzlePosition;
		} else if (lesson.partNumber === partNumber) {
			newStatus = 'available';
		} else {
			newStatus = 'locked';
		}

		await db
			.update(lessonProgress)
			.set({
				status: newStatus,
				puzzleEarned,
				comprehensionMode: lesson.partNumber < partNumber ? row.lesson_progress.comprehensionMode : null,
				comprehensionScore: lesson.partNumber < partNumber ? row.lesson_progress.comprehensionScore : null,
				comprehensionData: lesson.partNumber < partNumber ? row.lesson_progress.comprehensionData : null,
				completedAt: lesson.partNumber < partNumber ? (row.lesson_progress.completedAt ?? new Date()) : null,
				startedAt: lesson.partNumber <= partNumber ? (row.lesson_progress.startedAt ?? new Date()) : null
			})
			.where(eq(lessonProgress.id, row.lesson_progress.id));
	}

	return json({ ok: true, slug: targetLesson.slug });
};
