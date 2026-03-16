export type LessonStatus =
	| 'locked'
	| 'available'
	| 'podcast_complete'
	| 'comprehension_complete'
	| 'complete';

export type ComprehensionMode = 'voice' | 'quiz';

export type PuzzlePosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'middle-left'
	| 'center'
	| 'middle-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export interface LessonData {
	id: string;
	partNumber: number;
	title: string;
	slug: string;
	podcastUrl: string;
	transcript: string;
	puzzlePosition: PuzzlePosition | null;
}

export interface UserProfile {
	id: string;
	name: string;
	role: string;
	teamSize: number;
	feedbackFrequency: string;
	comfortLevel: number;
	challenges: string[];
	scenario: string | null;
}

export interface ComprehensionAssessment {
	understood: boolean;
	confidence: number;
	gaps: string[];
	summary: string;
}

export interface QuizQuestion {
	type: 'multiple-choice' | 'order' | 'freeform' | 'fill-in-the-blank' | 'true-false' | 'matching';
	question: string;
	options?: string[];
	correct?: number | number[];
	items?: string[];
	evaluationHint?: string;
	/** fill-in-the-blank: available words to drag into blanks */
	wordBank?: string[];
	/** fill-in-the-blank: correct answers for each blank in order */
	blanks?: string[];
	/** true-false: the correct answer */
	correctBool?: boolean;
	/** true-false / matching: explanation shown after answering */
	explanation?: string;
	/** matching: left-side items */
	leftItems?: string[];
	/** matching: right-side items */
	rightItems?: string[];
	/** matching: correct mapping — correctPairs[i] is the rightItems index for leftItems[i] */
	correctPairs?: number[];
}

export interface SubtitleCue {
	id: number;
	start: number;
	end: number;
	text: string;
}
