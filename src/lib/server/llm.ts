import { env } from '$env/dynamic/private';
import type { StructuredFeedback } from '$lib/types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

function buildDevFeedback(objectives: string[]): StructuredFeedback {
	return {
		score: 0.85,
		summary: 'Development mode: comprehension evaluation skipped (no API key configured).',
		objectiveAssessments: objectives.map((obj, i) => ({
			objective: obj,
			met: i % 3 !== 2,
			feedback:
				i % 3 !== 2
					? 'You demonstrated solid understanding of this concept.'
					: 'This area could use more attention — try revisiting the key examples.'
		})),
		strengths: ['Clear grasp of core concepts', 'Good use of examples'],
		nextSteps: ['Review objectives that were missed', 'Practice applying the framework']
	};
}

function fallbackFeedback(summary: string): StructuredFeedback {
	return {
		score: 0.7,
		summary,
		objectiveAssessments: [],
		strengths: [],
		nextSteps: []
	};
}

function parseStructuredFeedback(content: string, objectives: string[]): StructuredFeedback {
	const result = JSON.parse(content);
	const assessments = Array.isArray(result.objectiveAssessments)
		? result.objectiveAssessments.map((a: Record<string, unknown>) => ({
				objective: String(a.objective || ''),
				met: Boolean(a.met),
				feedback: String(a.feedback || '')
			}))
		: objectives.map((obj) => ({ objective: obj, met: true, feedback: '' }));

	return {
		score: Number(result.score) || 0,
		summary: String(result.summary || ''),
		objectiveAssessments: assessments,
		strengths: Array.isArray(result.strengths) ? result.strengths.map(String) : [],
		nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps.map(String) : []
	};
}

export async function evaluateComprehension(params: {
	lessonTitle: string;
	lessonObjectives: string[];
	userRole: string;
	userTeamSize: number;
	userComfortLevel: number;
	transcript: Array<{ role: string; content: string }>;
}): Promise<StructuredFeedback> {
	if (!env.OPENROUTER_API_KEY) {
		return buildDevFeedback(params.lessonObjectives);
	}

	const objectivesList = params.lessonObjectives
		.map((o, i) => `${i + 1}. ${o}`)
		.join('\n');

	const formattedTranscript = params.transcript
		.map((t) => `${t.role === 'user' ? 'Learner' : 'AI Host'}: ${t.content}`)
		.join('\n');

	const systemPrompt = `You are evaluating a learner's understanding of "${params.lessonTitle}".
The learner is a ${params.userRole} who manages ${params.userTeamSize} people.
They rated their feedback comfort level at ${params.userComfortLevel}/5.

Lesson objectives:
${objectivesList}

Evaluate the following conversation/response for genuine understanding.
For each objective, assess whether the learner demonstrated understanding.
Write feedback in SBI-N style: "[What happened in the conversation] — [impact on assessment]. [Concrete next-step suggestion]."

Be generous but honest. Return JSON only.

Return a JSON object with this exact structure:
{
  "score": number between 0 and 1,
  "summary": "1-2 sentence overall assessment",
  "objectiveAssessments": [
    { "objective": "objective text", "met": true/false, "feedback": "SBI-N style feedback" }
  ],
  "strengths": ["1-3 things done well"],
  "nextSteps": ["1-3 actionable improvements"]
}`;

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
				{ role: 'user', content: formattedTranscript }
			],
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		console.error('OpenRouter API error:', response.status, await response.text());
		return fallbackFeedback('Evaluation service temporarily unavailable. Defaulting to pass.');
	}

	const data = await response.json();
	const content = data.choices?.[0]?.message?.content;

	if (!content) {
		return fallbackFeedback('Could not parse evaluation response. Defaulting to pass.');
	}

	try {
		return parseStructuredFeedback(content, params.lessonObjectives);
	} catch {
		return fallbackFeedback('Could not parse evaluation response. Defaulting to pass.');
	}
}

export async function evaluateFreeform(params: {
	question: string;
	response: string;
	evaluationHint: string;
	userRole: string;
}): Promise<StructuredFeedback> {
	if (!env.OPENROUTER_API_KEY) {
		return {
			score: 0.8,
			summary: 'Development mode: freeform evaluation skipped (no API key configured).',
			objectiveAssessments: [
				{
					objective: params.evaluationHint || params.question,
					met: true,
					feedback: 'Your response demonstrates understanding of the concept.'
				}
			],
			strengths: ['Thoughtful response'],
			nextSteps: ['Consider adding a specific example']
		};
	}

	const systemPrompt = `You are evaluating a learner's freeform response to a comprehension question.
The learner is a ${params.userRole}.

Question: ${params.question}

Evaluation criteria: ${params.evaluationHint}

Evaluate the response for genuine understanding and application.
Write feedback in SBI-N style: "[What the learner wrote] — [impact]. [Next step suggestion]."
Be generous but honest. Return JSON only.

Return a JSON object with this exact structure:
{
  "score": number between 0 and 1,
  "summary": "1-2 sentence constructive feedback",
  "objectiveAssessments": [
    { "objective": "the evaluation criteria", "met": true/false, "feedback": "SBI-N style feedback" }
  ],
  "strengths": ["1-2 things done well"],
  "nextSteps": ["1-2 improvements"]
}`;

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
				{ role: 'user', content: params.response }
			],
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		console.error('OpenRouter API error:', response.status, await response.text());
		return fallbackFeedback('Evaluation service temporarily unavailable. Defaulting to pass.');
	}

	const data = await response.json();
	const content = data.choices?.[0]?.message?.content;

	if (!content) {
		return fallbackFeedback('Could not parse evaluation response. Defaulting to pass.');
	}

	try {
		return parseStructuredFeedback(content, [params.evaluationHint || params.question]);
	} catch {
		return fallbackFeedback('Could not parse evaluation response. Defaulting to pass.');
	}
}
