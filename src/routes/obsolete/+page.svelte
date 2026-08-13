<script lang="ts">
	import { brand, repoLink } from '$lib/brand';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>{brand} and the new StudentVUE protocol</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<Card.Root class="m-4 max-w-xl">
			<Card.Header>
				<Card.Title>The old StudentVUE protocol is gone</Card.Title>
			</Card.Header>

			<Card.Content class="text-tertiary-foreground space-y-4">
				<p class="italic">December 2023 - July 2026 as a website-only login</p>

				<p>
					If you've been logged in to GradeCompass, you may see an error message saying that the app
					is deprecated. This is because the student portal software that GradeCompass is designed
					for has been updated, and the SOAP protocol that GradeCompass used is no longer supported.
				</p>

				<p>
					A website cannot attach a StudentVUE login session anymore: the new protocol uses HttpOnly
					SameSite cookies, and cross-origin requests are not allowed to send those credentials.
					GradeCompass still will not send your data through a server.
				</p>

				<p>
					The companion browser extension is the on-device bridge. You log in on the official
					StudentVUE site; the extension reads gradebook data with your browser cookies and hands
					JSON to GradeCompass running locally. See the
					<a href={repoLink} class="underline">README</a> for install instructions.
				</p>

				<p>
					<a href="/login" class="underline">Log in</a> •
					<a href="/" class="underline">Home</a>
				</p>
			</Card.Content>
		</Card.Root>
	</main>
</div>
