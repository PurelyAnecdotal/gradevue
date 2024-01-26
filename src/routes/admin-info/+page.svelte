<script lang="ts">
	import { browser } from '$app/environment';
	import { Card } from 'flowbite-svelte';

	let email = '[email protected]';
	if (browser) email = 'hello@gradevue.org';
</script>

<div class="flex items-center justify-center min-h-screen">
	<Card size="lg" class="gap-4">
		<h1 class="text-2xl text-white">About the privacy of GradeVue</h1>
		<p>
			I developed GradeVue during winter break after using SynergyPlus and being concerned about the
			privacy of the service. GradeVue is designed to keep students' information private the entire
			time you use the service. It's similar to using the StudentVue app; even though you're not
			viewing the offical website, you're still accessing your grades securely, just in a more
			convenient manner.
		</p>

		<p>
			When a student logs in to GradeVue, their username and password are sent directly to the
			offical website, using the built-in
			<a href="https://ca-pleas-psv.edupoint.com/Service/PXPCommunication.asmx" class="text-primary-600 underline">Synergy API</a>.
			This is different from SynergyPlus, which sends the login information through their servers
			without ever informing the user.
		</p>

		<span>
			If you have questions or concerns about GradeVue, please contact me at
			<a href="mailto:{email}" class="text-primary-600 underline">{email}</a>.
		</span>
	</Card>
</div>
