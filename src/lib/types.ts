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
	type: 'multiple-choice' | 'order' | 'freeform';
	question: string;
	options?: string[];
	correct?: number | number[];
	items?: string[];
	evaluationHint?: string;
}
