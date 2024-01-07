<script>
	import { Alert, Button } from 'flowbite-svelte';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';
</script>

<p>
	Gradebook isn't able to use Sign in with Google to sign you in. You'll need to create a password
	for StudentVue that Gradebook can sign you in with instead.
	<span class="font-bold">
		You'll still be able to use Sign in with Google with StudentVue afterwards.
	</span>
</p>

<Button href="https://ca-pleas-psv.edupoint.com/PXP2_Password_Help.aspx" target="_blank">
	Set your StudentVue password
</Button>

<Alert color="dark" class="p-0">
	<InfoCircleOutline slot="icon" size="sm" class="focus:outline-none" />
	If you've used SynergyPlus before, you can use the same password to
	<a href="/login" class="text-primary-600 underline">log in to Gradebook</a>.
</Alert>

<p>
	You should receive an email that will contain a link to set your password. <span class="font-bold"
		>This may take a few minutes.</span
	>
	Once you've created your password, you can
	<a href="/login" class="text-primary-600 underline">log in</a>.
</p>
