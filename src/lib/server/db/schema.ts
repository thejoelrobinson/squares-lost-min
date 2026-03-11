import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulidx';

export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	name: text('name').notNull(),
	role: text('role').notNull(),
	teamSize: integer('team_size').notNull(),
	feedbackFrequency: text('feedback_frequency').notNull(),
	comfortLevel: integer('comfort_level').notNull(),
	challenges: text('challenges').notNull(), // JSON array
	scenario: text('scenario'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const lessons = sqliteTable('lessons', {
	id: text('id').primaryKey(),
	partNumber: integer('part_number').notNull(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	podcastUrl: text('podcast_url').notNull(),
	transcript: text('transcript').notNull().default(''),
	puzzlePosition: text('puzzle_position')
});

export const lessonProgress = sqliteTable('lesson_progress', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lessons.id),
	status: text('status').notNull().default('locked'),
	comprehensionMode: text('comprehension_mode'),
	comprehensionData: text('comprehension_data'), // JSON
	comprehensionScore: real('comprehension_score'),
	puzzleEarned: integer('puzzle_earned', { mode: 'boolean' }).notNull().default(false),
	startedAt: integer('started_at', { mode: 'timestamp' }),
	completedAt: integer('completed_at', { mode: 'timestamp' })
});

export const conversations = sqliteTable('conversations', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lessons.id),
	transcript: text('transcript').notNull(), // JSON array of turns
	aiAssessment: text('ai_assessment'), // JSON
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
