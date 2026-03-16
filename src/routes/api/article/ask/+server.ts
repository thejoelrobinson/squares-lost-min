import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, getLessonBySlug } from '$lib/server/db/queries';
import { lessonContent } from '$lib/content/lesson-data';
import { env } from '$env/dynamic/private';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const { lessonSlug, question, history = [] } = await request.json();
	if (!lessonSlug || !question) {
		error(400, 'Missing required fields');
	}

	const [user, lesson] = await Promise.all([
		getUserById(locals.userId),
		getLessonBySlug(lessonSlug)
	]);

	if (!user) error(404, 'User not found');
	if (!lesson) error(404, 'Lesson not found');

	const content = lessonContent[lessonSlug];
	const objectives = content?.objectives?.join('\n- ') ?? '';

	const systemPrompt = `You are Sam, a warm and insightful leadership coach helping ${user.name} understand the article "${lesson.title}".${objectives ? `\n\nThe lesson covers these objectives:\n- ${objectives}` : ''}

Your role is to help the reader dive deeper into the material. Be concise (2–4 sentences), warm, and practical. Occasionally ask a follow-up question to deepen their thinking. Stay focused on the lesson topic.`;

	if (!env.OPENROUTER_API_KEY) {
		return json({
			answer:
				"That's a great question! Try reflecting on how this applies to a real 1:1 you've had recently. What would you do differently now?"
		});
	}

	const model = env.LLM_MODEL || DEFAULT_MODEL;

	const response = await fetch(OPENROUTER_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENROUTER_API_KEY}`
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				...history,
				{ role: 'user', content: question }
			]
		})
	});

	if (!response.ok) {
		console.error('OpenRouter API error:', response.status, await response.text());
		error(502, 'LLM service unavailable');
	}

	const data = await response.json();
	const answer =
		data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

	return json({ answer });
};
