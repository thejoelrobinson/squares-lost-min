import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById } from '$lib/server/db/queries';
import { getLessonBySlug } from '$lib/server/db/queries';
import { evaluateComprehension } from '$lib/server/llm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const body = await request.json();
	const { lessonId, transcript, mode } = body;

	if (!lessonId || !transcript || !mode) {
		error(400, 'Missing required fields: lessonId, transcript, mode');
	}

	if (mode !== 'voice' && mode !== 'quiz') {
		error(400, 'Invalid mode: must be "voice" or "quiz"');
	}

	const user = await getUserById(locals.userId);
	if (!user) {
		error(404, 'User not found');
	}

	// lessonId could be slug or id — try slug first for friendlier API
	const lesson = await getLessonBySlug(lessonId);
	if (!lesson) {
		error(404, 'Lesson not found');
	}

	const result = await evaluateComprehension({
		lessonTitle: lesson.title,
		lessonObjectives: lesson.transcript, // Using transcript as proxy for objectives
		userRole: user.role,
		userTeamSize: user.teamSize,
		userComfortLevel: user.comfortLevel,
		transcript
	});

	return json(result);
};
