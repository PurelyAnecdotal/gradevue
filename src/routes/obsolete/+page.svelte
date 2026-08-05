<script lang="ts">
	import { brand, repoLink } from '$lib/brand';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>{brand} is now obsolete</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<Card.Root class="m-4 max-w-xl">
			<Card.Header>
				<Card.Title>{brand} is now obsolete</Card.Title>
			</Card.Header>

			<Card.Content class="text-tertiary-foreground space-y-4">
				<p class="italic">December 2023 - July 2026</p>

				<p>
					If you've been logged in to GradeCompass, you may see an error message saying that the app
					is deprecated. This is because the student portal software that GradeCompass is designed
					for has been updated, and the protocol that GradeCompass uses is no longer supported.
				</p>

				<p>
					This isn't something that's under our control. Unfortunately, this means that GradeCompass
					will no longer work starting in the 2026-2027 school year.
				</p>

				<p>
					We'd like to thank the tens of thousands of students who have used GradeCompass over the
					years. We're honored to have built something that directly served so many people.
				</p>

				<p class="text-secondary-foreground">
					Why can't GradeCompass be updated to work with the new version?
				</p>

				<p>
					From the start, GradeCompass was designed so that your data is securely retrieved and
					processed on your device directly. This was only possible due to how the original protocol
					was configured. The new protocol is not configured in this way, meaning that any website
					that works with the new protocol must send your data through its servers, compromising
					your privacy.
				</p>

				<p>
					Updating to the new protocol would undermine this core principle of GradeCompass. It would
					also require significant development work to rewrite much of GradeCompass's code. As such,
					GradeCompass will not be updated. It will remain in a demo-only state.
				</p>

				<p class="text-secondary-foreground">What about GradeCompass's code?</p>

				<p>
					GradeCompass's code is <a href={repoLink} class="underline">open source</a> under the MIT license.
					You are welcome to reuse its code or designs in your own projects. Attribution is always appreciated.
				</p>
			</Card.Content>
		</Card.Root>
	</main>
</div>
