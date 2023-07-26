<script lang="ts">
	import { NavBrand, NavHamburger, Dropdown } from 'flowbite-svelte';
	import { urls } from '$config/routes';
	import { userObject } from '$routes/profile/mockprofiledata';
	import Dialog from './Dialog.svelte';

</script>

<header>
	<nav class="bg-secondary-500 dark:bg-secondary-900 p-4">
		<div class="mx-auto flex flex-wrap items-center container flex-row gap-4">
			<a href="/">
				<!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" /> -->
				<span class="self-center whitespace-nowrap text-xl font-semibold text-white">CodinCod</span>
			</a>

			<ul class="ml-auto">
				<li>
					<a href={urls.puzzle}>Puzzle</a>
				</li>
			</ul>

			<button>
				<img
					id="avatar-menu"
					class="rounded-full w-10 h-10 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
					src={userObject.avaterUrl}
					alt=""
				/>
				<!-- <NavHamburger on:click={toggle} class1="w-full md:flex md:w-auto md:order-1" /> -->
			</button>

			<Dialog>

			</Dialog>

			<Dropdown placement="bottom" triggeredBy="#avatar-menu">
				<p class="text-sm block">
					{userObject.username}
				</p>
				<ul>
					<li><a href={urls.profile}>Profile</a></li>
					<li><a href={urls.settings}>Settings</a></li>
					<li><a href={urls.signOut}>Sign out</a></li>
				</ul>
			</Dropdown>
		</div>
	</nav>
</header>
