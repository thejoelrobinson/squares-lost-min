import type { QuizQuestion } from '$lib/types';

export const partNumber = 10;
export const title = 'Advanced Tactics for Guiding Difficult Conversations';
export const slug = 'listening-after-you-speak';
export const objectives = ['Practice active listening after delivering feedback'];
export const voicePromptTemplate =
	'You are Jordan. Discuss active listening with the learner.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What is the most important thing to do after giving feedback?',
		options: [
			'Move on to the next topic',
			'Listen to their response',
			'Document the conversation',
			'Ask them to sign an acknowledgment'
		],
		correct: 1
	}
];
