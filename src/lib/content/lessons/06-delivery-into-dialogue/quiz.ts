import type { QuizQuestion } from '$lib/types';

export const partNumber = 6;
export const title = 'Transforming Delivery into Dialogue (The SBI-N Model)';
export const slug = 'reading-the-room';
export const objectives = ['Recognize emotional cues and ensure psychological safety'];
export const voicePromptTemplate =
	'You are Jordan. Discuss emotional awareness with the learner.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What is psychological safety?',
		options: [
			'Avoiding all conflict',
			'Feeling safe to take interpersonal risks',
			'Having a private office',
			'Never receiving negative feedback'
		],
		correct: 1
	}
];
