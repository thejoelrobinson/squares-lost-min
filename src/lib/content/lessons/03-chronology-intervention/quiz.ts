import type { QuizQuestion } from '$lib/types';

export const partNumber = 3;
export const title = 'The Chronology and Purpose of Intervention';
export const slug = 'sbi-framework';
export const objectives = [
	'Understand the Situation-Behavior-Impact framework',
	'Apply SBI to structure feedback conversations',
	'Distinguish between observations and judgments'
];
export const voicePromptTemplate = `You are Jordan, the podcast host. You just finished explaining the SBI framework with your co-host. Now turn to the learner and have a brief Socratic conversation to check their understanding. Reference their role as a {{user.role}} managing {{user.team_size}} people. Ask them to apply SBI to a real situation they've encountered.`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What does SBI stand for?',
		options: [
			'Situation, Behavior, Impact',
			'Summary, Background, Insight',
			'Specific, Brief, Immediate'
		],
		correct: 0
	},
	{
		type: 'order',
		question: 'Put these in the correct SBI order:',
		items: ['Describe the impact', 'State the situation', 'Name the behavior'],
		correct: [1, 2, 0]
	},
	{
		type: 'freeform',
		question:
			'Describe a recent situation where you could have used SBI. Write it out using the framework.',
		evaluationHint:
			'Look for clear separation of situation, behavior, and impact. Should reference a specific event, not a generalization.'
	}
];
