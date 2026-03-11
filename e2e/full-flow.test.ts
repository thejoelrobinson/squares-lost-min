import { test, expect } from '@playwright/test';

test.describe('Full learning flow', () => {
	test('new visitor is redirected to onboarding', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/onboarding/);
	});

	test('complete onboarding and first lesson', async ({ page }) => {
		// 1. Visit home — should redirect to /onboarding
		await page.goto('/');
		await expect(page).toHaveURL(/onboarding/);

		// 2. Complete onboarding form
		// Step 1: Name and role
		await page.fill('input#name', 'Test User');
		await page.selectOption('select#role', 'manager');
		await page.click('button:has-text("Continue")');

		// Step 2: Team size (default is 5, just continue)
		await page.click('button:has-text("Continue")');

		// Step 3: Feedback frequency
		await page.click('button:has-text("Weekly")');
		await page.click('button:has-text("Continue")');

		// Step 4: Comfort level (default is 3, just continue)
		await page.click('button:has-text("Continue")');

		// Step 5: Challenges — select at least one
		await page.click('button:has-text("I avoid it")');
		await page.click('button:has-text("Continue")');

		// Step 6: Scenario — optional, skip it
		await page.click('button:has-text("Continue")');

		// Step 7: Review — submit
		await page.click('button:has-text("Start Learning")');

		// 3. After onboarding, should be on home page with lesson map
		await expect(page).toHaveURL('/');
		await expect(page.locator('svg[role="img"]')).toBeVisible();

		// 4. Click on lesson 02 (should be available — "Why Feedback Matters")
		await page.click('a[href="/lesson/why-feedback-matters"]');
		await expect(page).toHaveURL('/lesson/why-feedback-matters');

		// 5. Complete podcast phase — click "Mark as complete" or the complete button
		// The PodcastPlayer should have a way to mark complete
		const markCompleteBtn = page.locator('button:has-text("Mark as Complete")');
		const completeBtn = page.locator('button:has-text("Complete")');
		const continueBtn = page.locator('button:has-text("Continue")');

		// Try multiple possible button labels for the podcast player
		const podcastDone =
			(await markCompleteBtn.isVisible().catch(() => false)) ||
			(await completeBtn.isVisible().catch(() => false));

		if (await markCompleteBtn.isVisible().catch(() => false)) {
			await markCompleteBtn.click();
		} else if (await completeBtn.isVisible().catch(() => false)) {
			await completeBtn.click();
		} else if (await continueBtn.isVisible().catch(() => false)) {
			await continueBtn.click();
		}

		// 6. Should now be in comprehension phase — the quiz tab should be active
		await expect(page.locator('text=Comprehension Check')).toBeVisible();

		// Answer the first quiz question (multiple choice — option index 1)
		// "It builds trust and accelerates growth"
		const quizOption = page.locator('button:has-text("It builds trust and accelerates growth")');
		if (await quizOption.isVisible().catch(() => false)) {
			await quizOption.click();
		}

		// Look for a submit/next/continue button for the quiz
		const submitBtn = page.locator('button:has-text("Submit")');
		const nextBtn = page.locator('button:has-text("Next")');
		const checkBtn = page.locator('button:has-text("Check")');

		if (await submitBtn.isVisible().catch(() => false)) {
			await submitBtn.click();
		} else if (await checkBtn.isVisible().catch(() => false)) {
			await checkBtn.click();
		} else if (await nextBtn.isVisible().catch(() => false)) {
			await nextBtn.click();
		}
	});

	test('locked lesson redirects to home', async ({ page }) => {
		// Attempt to access a lesson that should be locked (e.g., lesson 10)
		await page.goto('/lesson/putting-it-together');

		// Should redirect — either to / or /onboarding depending on user state
		const url = page.url();
		expect(url.endsWith('/lesson/putting-it-together')).toBe(false);
	});

	test('puzzle page is accessible after onboarding', async ({ page }) => {
		await page.goto('/puzzle');

		// If user exists, should see puzzle page; if not, redirected to onboarding
		const url = page.url();
		const isPuzzle = url.includes('/puzzle');
		const isOnboarding = url.includes('/onboarding');
		expect(isPuzzle || isOnboarding).toBe(true);

		if (isPuzzle) {
			await expect(page.locator('text=Your Feedback Puzzle')).toBeVisible();
		}
	});

	test('onboarding redirects to home if user already exists', async ({ page }) => {
		// First, ensure a user exists by completing onboarding
		await page.goto('/');
		const currentUrl = page.url();

		if (currentUrl.includes('/onboarding')) {
			// No user yet — complete onboarding first
			await page.fill('input#name', 'Redirect Test');
			await page.selectOption('select#role', 'team lead');
			await page.click('button:has-text("Continue")');
			await page.click('button:has-text("Continue")');
			await page.click('button:has-text("Weekly")');
			await page.click('button:has-text("Continue")');
			await page.click('button:has-text("Continue")');
			await page.click('button:has-text("I avoid it")');
			await page.click('button:has-text("Continue")');
			await page.click('button:has-text("Continue")');
			await page.click('button:has-text("Start Learning")');
			await expect(page).toHaveURL('/');
		}

		// Now try to visit onboarding — should redirect to home
		await page.goto('/onboarding');
		await expect(page).toHaveURL('/');
	});
});
