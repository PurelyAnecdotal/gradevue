<script lang="ts">
	import { brand } from '$lib';
	import { Button } from 'flowbite-svelte';
	import LinkOutline from 'flowbite-svelte-icons/LinkOutline.svelte';
</script>

<p>
	{brand} isn't able to use Sign in with Google to sign you in. You'll need to create a password for StudentVUE
	that {brand} can sign you in with instead.
	<span class="font-bold">
		You'll still be able to use Sign in with Google with StudentVUE afterwards.
	</span>
</p>

<Button
	href="https://ca-pleas-psv.edupoint.com/PXP2_Password_Help.aspx"
	target="_blank"
	class="mx-auto flex w-fit items-center gap-2"
>
	Set your StudentVUE password
	<LinkOutline />
</Button>

<p>
	You should receive an email that will contain a link to set your password. <span class="font-bold"
		>This may take a few minutes.</span
	>
	Once you've created your password, you can
	<a href="/login" class="text-primary-600 underline">log in</a>.
</p>

<p>If you never receive an email, contact your district's IT support.</p>
