import type { QuizQuestion } from '$lib/types';

export const partNumber = 2;
export const title = 'The Psychology and Perception of Feedback';
export const slug = 'why-feedback-matters';
export const objectives = [
	'Understand that feedback is simply information, not inherently good or bad',
	'Recognize how personal lens and brain wiring shape our reaction to feedback',
	'Appreciate the emotional dimension of giving and receiving feedback'
];
export const voicePromptTemplate = `You are Jordan, the podcast host. You just finished explaining why feedback matters with your co-host. Now turn to the learner and have a brief Socratic conversation to check their understanding. Reference their role as a {{user.role}} managing {{user.team_size}} people. Ask them why feedback matters specifically in their context.`;

export const jamieOpener = "Hey, welcome back! That episode covered a lot. What's your honest first reaction to the idea that feedback is just neutral information?";

export const jamieSystemPrompt = `You are Jordan, a podcast host who just finished an episode about the psychology and perception of feedback with your co-host. You're now having a short Socratic conversation with the learner to check their understanding.

## Key concepts from the episode
- Feedback is simply information — neither inherently good nor bad
- Our "personal lens" (mindset, past experiences, expectations) filters how we receive feedback
- The brain is wired to make quick, reactive judgments before we've reflected on intent
- The same feedback can land completely differently with two different people
- The emotional dimension matters: people remember how you made them feel

## Instructions
- Ask open-ended questions that surface the learner's understanding of the concepts above
- Probe with follow-ups like "Why do you think that is?" or "Can you give me an example?"
- Keep responses conversational and concise (2-3 sentences)
- After 4-6 meaningful exchanges, wrap up warmly and append [DONE] at the very end of your final message`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'At its very core, what is feedback?',
		options: ['Inherently bad', 'A reward for hard work', 'Simply information', 'A personal attack'],
		correct: 2
	},
	{
		type: 'fill-in-the-blank',
		question:
			'Our brains are wired to quickly interpret feedback through a personal 1. _____, often making 2. _____ judgments based on our past experiences and existing 3. _____.',
		wordBank: ['Expectations', 'Lens', 'Snap'],
		blanks: ['Lens', 'Snap', 'Expectations']
	},
	{
		type: 'true-false',
		question:
			'Because feedback is just data, the exact same piece of feedback will always feel the same to two different people.',
		correctBool: false,
		explanation:
			'The same feedback can feel encouraging to one person and critical to another!'
	},
	{
		type: 'matching',
		question: 'Match each concept to its description.',
		leftItems: ['Feedback', 'The Personal Lens', "The Brain's Wiring"],
		rightItems: [
			'Causes us to make quick, reactive judgments before reflecting on intent.',
			'Is neither inherently good nor inherently bad.',
			'Includes an individual\u2019s mindset, past experiences, and expectations.'
		],
		correctPairs: [1, 2, 0]
	},
	{
		type: 'multiple-choice',
		question:
			'Maya Angelou said: "I\'ve learned that people will forget what you said, people will forget what you did, but people will never forget..."',
		options: [
			'"...how you corrected their mistakes."',
			'"...how you made them feel."',
			'"...the exact words you used."'
		],
		correct: 1
	}
];
