import type { QuizQuestion } from '$lib/types';

export const partNumber = 4;
export const title = 'The SBI Structural Model';
export const slug = 'timing-is-everything';
export const objectives = ['Understand when to give feedback for maximum impact'];
export const voicePromptTemplate =
	'You are Jordan. Discuss timing of feedback with the learner.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'When is the best time to give feedback?',
		options: [
			'During annual reviews',
			'As close to the event as possible',
			'Only when asked',
			'At the end of a project'
		],
		correct: 1
	}
];
