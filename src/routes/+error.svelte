<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center gap-4">
	<h1 class="text-4xl font-bold text-error">{page.status}</h1>
	<p class="text-text-muted">{page.error?.message ?? 'Something went wrong'}</p>
	<a href="/" class="text-primary hover:underline">Back to home</a>
</div>
