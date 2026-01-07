<script lang="ts">
	import { brand } from '$lib/brand';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import InfoIcon from '@lucide/svelte/icons/info';
	import { SvelteURL } from 'svelte/reactivity';
	import { twMerge } from 'tailwind-merge';

	let pastedUrl = $state('');

	const convertedUrl = $derived.by(() => {
		try {
			const url = new SvelteURL(pastedUrl);
			url.pathname = '/PXP2_Password_Help.aspx';
			return url.toString();
		} catch {
			return undefined;
		}
	});
</script>

<Card.Root class="max-w-sm">
	<Card.Header>
		<Card.Description>Sign up for {brand}</Card.Description>
		<Card.Title>Create a password</Card.Title>
	</Card.Header>

	<Card.Content class="text-tertiary-foreground space-y-4 text-sm">
		<p>
			{brand} isn't able to use Sign in with Google to sign you in. You'll need to create a password for
			StudentVUE that {brand} can sign you in with instead.
		</p>

		<p>You'll still be able to use Sign in with Google with StudentVUE afterwards.</p>

		<Dialog.Root>
			<Dialog.Trigger
				class={twMerge(buttonVariants({ variant: 'outline' }), 'mx-auto flex items-center gap-2')}
			>
				<InfoIcon class="h-4 w-4" /> How to set your StudentVUE password
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Password Reset Help</Dialog.Title>
					<Dialog.Description>
						The exact link to reset your password depends on your district. If you don't know how to
						find it, try these steps:
					</Dialog.Description>
				</Dialog.Header>

				<h4>Find automatically</h4>

				<p class="text-muted-foreground text-sm">
					Paste a link to any page on your district's StudentVUE website and we'll take you to the
					password reset page:
				</p>

				<div class="flex items-center gap-2">
					<Input
						type="url"
						placeholder="https://[your-district]-psv.edupoint.com/Home_PXP2.aspx"
						bind:value={pastedUrl}
					/>
					<Button href={convertedUrl} disabled={convertedUrl === undefined} target="_blank">
						Open
					</Button>
				</div>

				<div class="items-center gap-4 md:flex">
					<div>
						<h4 class="mb-4">Find manually</h4>
						<ol class="text-muted-foreground list-inside list-decimal space-y-4 text-sm">
							<li>
								On your district's StudentVUE website, go to the login page (you may need to
								temporarily log out to get there).
							</li>
							<li>Open the "More Options" dropdown.</li>
							<li>
								Click "Forgot Password". (It does not matter whether you had a password previously.)
							</li>
						</ol>
					</div>

					<img
						src="/password-reset-location.png"
						class="mx-auto mt-4 max-h-96 md:h-48"
						alt="Screenshot of the StudentVUE login page showing the 'Forgot Password' button"
					/>
				</div>
			</Dialog.Content>
		</Dialog.Root>

		<p>
			You should receive an email that will contain a link to set your password.
			<span class="font-bold">This may take a few minutes.</span>
			Once you've created your password, you can
			<a href="/login" class="text-foreground underline">log in</a>.
		</p>

		<p>
			If you never receive an email the first time, wait a while and try again. Some students have
			reported needing to try several times over the course of a few days before they received the
			email.
		</p>
	</Card.Content>
</Card.Root>
