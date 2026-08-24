<script lang="ts">
	import { brand, repoLink } from '$lib/brand';
	import BackButton from '$lib/components/BackButton.svelte';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>{brand} is now obsolete</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<div class="m-4 max-w-xl space-y-2">
			<BackButton />

			<Card.Root>
				<Card.Header>
					<Card.Title>{brand} is now obsolete</Card.Title>
				</Card.Header>

				<Card.Content class="text-tertiary-foreground space-y-4">
					<p class="italic">December 2023 - July 2026</p>

					<p>
						If you've been logged in to GradeCompass, you may see an error message saying that the
						app is deprecated. This is because the student portal software that GradeCompass is
						designed for has been updated, and the protocol that GradeCompass uses is no longer
						supported.
					</p>

					<p>
						This isn't something that's under our control. Unfortunately, this means that
						GradeCompass will no longer work starting in the 2026-2027 school year.
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
						processed on your device directly. This was only possible due to how the original
						protocol was configured.
					</p>

					<p>
						The new protocol is not configured in this way, which means that any website that uses
						the new protocol has to send your data through its servers. This poses legal risks for
						the site's operator, and if not configured securely, can expose your personal data to
						them.
					</p>
					<p>
						Updating GradeCompass to the new protocol would require violating GradeCompass's privacy
						and safety guarantee. As such, GradeCompass will not be updated. It will remain in a
						demo-only state.
					</p>

					<p class="text-secondary-foreground">What about GradeCompass's code?</p>

					<p>
						GradeCompass's code is <a href={repoLink} class="underline">open source</a> under the MIT
						license. You are free to reuse its code or designs in your own projects. Attribution is always
						appreciated.
					</p>
				</Card.Content>
			</Card.Root>
		</div>
	</main>
</div>
