import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, getLessonBySlug } from '$lib/server/db/queries';
import { buildAgentConfig } from '$lib/server/elevenlabs';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const { lessonSlug, transcriptContext } = await request.json();
	if (!lessonSlug) {
		error(400, 'Missing lessonSlug');
	}

	const user = await getUserById(locals.userId);
	if (!user) {
		error(404, 'User not found');
	}

	const lesson = await getLessonBySlug(lessonSlug);
	if (!lesson) {
		error(404, 'Lesson not found');
	}

	const context = transcriptContext
		? `The learner paused the podcast to ask a question. Here is what they have heard so far:\n\n${transcriptContext}`
		: 'The learner paused the podcast to ask a question. No transcript context available yet.';

	const config = buildAgentConfig(
		{ title: lesson.title, slug: lesson.slug },
		{
			name: user.name,
			role: user.role,
			teamSize: user.teamSize,
			comfortLevel: user.comfortLevel
		},
		context
	);

	return json(config);
};
