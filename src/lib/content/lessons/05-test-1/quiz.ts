import type { QuizQuestion } from '$lib/types';

export const partNumber = 5;
export const title = 'Feedback in Action';
export const slug = 'test-1';
export const objectives = [
	'Apply lessons 02-04 cumulatively in a realistic feedback scenario',
	'Construct properly structured SBI feedback for both corrective and positive situations',
	'Demonstrate awareness of how personal lens and emotional reactions affect feedback delivery',
	'Identify the right timing and objectives (redirect drift vs. reinforce success) for feedback interventions'
];
export const scenarioBriefing = `It's Friday afternoon, and you're about to sit down for a 1:1 with Jamie — one of the associates on your team.

On **Tuesday morning**, your team presented quarterly results to an important client. Two moments stood out:

**The backup slide** — Midway through, the client was confused by a data visualization. Jamie proactively pulled up a backup slide with clearer visuals, saving the presentation flow. Sharp, well-prepared move.

**The Q&A interruptions** — During Q&A, your senior colleague **Taylor** was fielding a question when Jamie jumped in and answered instead. This happened **three times**. On the third interruption, Jamie stated a project timeline that **hasn't been confirmed**. The client shifted uncomfortably. Taylor was visibly frustrated afterward.

You need to give feedback on **both** behaviors. Use everything you've learned about the psychology of feedback, timing, and the SBI model.`;

export const voicePromptTemplate = `You are Jamie, the podcast host — but in this scenario you are role-playing as an associate on the learner's team. The learner (a {{user.role}} managing {{user.team_size}} people) needs to practice giving you feedback on two behaviors from a recent client presentation: (1) you proactively pulled up a backup slide when the client was confused — great initiative, and (2) you interrupted a senior colleague Taylor three times during Q&A and stated an unconfirmed project timeline. Guide the learner through giving SBI-structured feedback on both behaviors. If they miss a component (Situation, Behavior, or Impact), prompt them to add it. Encourage them to use observable language and avoid assumptions.`;

export const jamieOpener =
	"Hey, good morning boss, you said you wanted to see me? What did you want to talk about?";

export const jamieSystemPrompt = `You are Jamie, an associate on the user's team. You are in a 1:1 meeting with your manager (the user).

## Context
On Tuesday morning, your team presented quarterly results to an important client. Two things happened:

1. **Backup slide**: Midway through, the client was confused by a data visualization. You proactively pulled up a backup slide with clearer visuals, saving the presentation flow. You're proud of this — you spent extra time preparing those backups.

2. **Q&A interruptions**: During Q&A, your senior colleague Taylor was fielding a question when you jumped in and answered instead. This happened three times. On the third interruption, you stated a project timeline that hasn't been confirmed. The client shifted uncomfortably. Taylor was visibly frustrated afterward.

## Your personality
- Friendly, enthusiastic, eager to do well
- When the backup slide is praised with specifics, you light up and share that you spent extra time preparing
- When the interruptions are brought up, you get a bit defensive at first ("I was just trying to help — Taylor was taking too long to answer") but you come around if the manager stays specific and non-judgmental
- If the manager uses vague or judgmental language, you get more defensive
- If the manager uses clear, observable language (SBI-style), you're more receptive

## Instructions
- Stay in character as Jamie at all times
- Respond naturally as a real person would — short, conversational replies (2-4 sentences typically)
- Do NOT coach the user or mention SBI/feedback frameworks — you're Jamie, not a teacher
- If the user only addresses one behavior, after a natural pause gently prompt: "Was there anything else from the presentation you wanted to discuss?"
- After the user has addressed BOTH behaviors (the backup slide AND the interruptions), wrap up the conversation naturally with something like "Thanks for the feedback, boss. I appreciate you being direct with me..." and append [DONE] at the very end of your message
- If the user seems to be wrapping up after addressing both topics, let them and respond with your wrap-up + [DONE]
- Do NOT end the conversation until both behaviors have been discussed`;

export const scenarioEvaluationObjectives = [
	'Used SBI structure (Situation, Behavior, Impact) for corrective feedback about the Q&A interruptions',
	'Used SBI structure for positive feedback about the backup slide initiative',
	'Used observable language rather than assumptions about intent',
	'Addressed both behaviors (interruptions and backup slide)',
	'Maintained a professional, respectful tone throughout',
	'Responded appropriately to Jamie\'s reactions (e.g., defensiveness about interruptions)'
];
export const quiz: QuizQuestion[] = [
	{
		type: 'true-false',
		question:
			"It's now Friday afternoon. The client presentation happened on Tuesday morning. Is this still ideal timing to give Jamie feedback about what happened?",
		correctBool: false,
		explanation:
			'Lesson 03 taught us that feedback is most effective when delivered close to the event. Three days later, the moment has lost its immediacy — details fade, and the connection between behavior and feedback weakens. Ideally, you would have spoken with Jamie on Tuesday itself.'
	},
	{
		type: 'multiple-choice',
		question:
			"Thinking about Jamie's two behaviors in the presentation, what are your two feedback objectives for this 1:1?",
		options: [
			'Redirect the drift (interrupting Taylor) and reinforce the success (backup slide initiative)',
			'Discipline Jamie for the interruptions and ignore the positive behavior',
			'Only praise the backup slide — corrective feedback will hurt the relationship',
			'Wait for the annual review to address both behaviors formally'
		],
		correct: 0
	},
	{
		type: 'matching',
		question:
			"Match each SBI component to the correct example for Jamie's interruption of Taylor during Q&A.",
		leftItems: ['Situation', 'Behavior', 'Impact'],
		rightItems: [
			'You answered questions that were directed at Taylor and stated a project timeline that hasn\'t been confirmed',
			'During the Q&A portion of our client presentation on Tuesday morning...',
			'The client looked uncomfortable, and Taylor was visibly frustrated — it undermined our team\'s credibility'
		],
		correctPairs: [1, 0, 2]
	},
	{
		type: 'multiple-choice',
		question:
			'Which of the following describes an observable behavior rather than a subjective assumption?',
		options: [
			'Jamie was being disrespectful to Taylor',
			'Jamie answered three questions that were directed at Taylor during the Q&A',
			'Jamie clearly doesn\'t respect senior colleagues',
			'Jamie was trying to show off in front of the client'
		],
		correct: 1
	},
	{
		type: 'fill-in-the-blank',
		question:
			'From Lesson 02: Feedback is ___. Every person filters it through their personal ___. When feedback feels like a personal ___, defensiveness takes over.',
		wordBank: ['Information', 'Lens', 'Attack', 'Opinion', 'Filter', 'Criticism'],
		blanks: ['Information', 'Lens', 'Attack']
	},
	{
		type: 'true-false',
		question:
			'The SBI model should only be used for corrective feedback, not for positive reinforcement.',
		correctBool: false,
		explanation:
			'The SBI model is equally powerful for positive feedback. Structured praise — specifying the situation, observable behavior, and its positive impact — is far more meaningful than a generic "good job." Jamie\'s backup slide initiative deserves the same structured recognition.'
	},
	{
		type: 'multiple-choice',
		question:
			'Jamie gets defensive when you bring up the interruptions. According to Lesson 02, which psychological response is she likely experiencing?',
		options: [
			'Her personal lens is filtering your feedback as an attack on her competence',
			'She is deliberately manipulating the conversation to avoid accountability',
			'She doesn\'t understand what SBI stands for',
			'She needs more time to process before any conversation can happen'
		],
		correct: 0
	},
	{
		type: 'multiple-choice',
		question:
			'You want to acknowledge Jamie\'s backup slide initiative. Which approach best uses the SBI model for positive feedback?',
		options: [
			'"Great job on Tuesday — keep it up!"',
			'"During the client presentation on Tuesday, when the client was confused by the visualization, you pulled up a backup slide with clearer visuals. That saved the flow and showed the client we were well-prepared."',
			'"You\'re always so prepared — I wish everyone on the team was like you."',
			'"The backup slide was a nice touch. I\'ll mention it in your annual review."'
		],
		correct: 1
	}
];
