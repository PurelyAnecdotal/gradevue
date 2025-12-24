<script lang="ts">
	import { brand } from '$lib/brand';
	import { Button, Input, Modal } from 'flowbite-svelte';
	import InfoCircleOutline from 'flowbite-svelte-icons/InfoCircleOutline.svelte';
	import { SvelteURL } from 'svelte/reactivity';

	let modalOpen = $state(false);

	function openModal() {
		modalOpen = true;
	}

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

<p>
	{brand} isn't able to use Sign in with Google to sign you in. You'll need to create a password for StudentVUE
	that {brand} can sign you in with instead.
</p>

<p>You'll still be able to use Sign in with Google with StudentVUE afterwards.</p>

<Button
	onclick={openModal}
	color="light"
	class="mx-auto flex w-fit cursor-pointer items-center gap-2"
>
	<InfoCircleOutline size="sm" />
	How to set your StudentVUE password
</Button>

<Modal
	bind:open={modalOpen}
	outsideclose={true}
	title="Password Reset Help"
	class="dark:text-gray-200"
	headerClass="flex items-center p-4 md:p-5 justify-between rounded-t-lg shrink-0 text-xl font-semibold text-gray-900 dark:text-white"
>
	<p>
		The exact link to reset your password depends on your district. If you don't know how to find
		it, try these steps:
	</p>

	<h4 class="text-lg">Find automatically</h4>

	<p>
		Paste a link to any page on your district's StudentVUE website and we'll take you to the
		password reset page:
	</p>

	<div class="flex items-center gap-2">
		<Input
			type="url"
			placeholder="https://[your-district]-psv.edupoint.com/Home_PXP2.aspx"
			bind:value={pastedUrl}
		/>
		<Button href={convertedUrl} disabled={convertedUrl === undefined} target="_blank">Open</Button>
	</div>

	<div class="items-center gap-4 md:flex">
		<div>
			<h4 class="mb-4 text-lg">Find manually</h4>
			<ol class="list-inside list-decimal space-y-4">
				<li>
					On your district's StudentVUE website, go to the login page (you may need to temporarily
					log out to get there).
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
</Modal>

<p>
	You should receive an email that will contain a link to set your password. <span class="font-bold"
		>This may take a few minutes.</span
	>
	Once you've created your password, you can
	<a href="/login" class="text-primary-600 underline">log in</a>.
</p>

<p>If you never receive an email, contact your district's IT support.</p>
