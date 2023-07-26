<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownHeader,
		DropdownDivider
	} from 'flowbite-svelte';
	import { urls } from '$config/routes';
	import { userObject } from '$routes/profile/mockprofiledata';
</script>

<header>
	<Navbar
		let:hidden
		let:toggle
		navClass="bg-secondary-500 dark:bg-secondary-900 p-4"
		navDivClass="mx-auto flex flex-wrap justify-between items-center container flex-row"
	>
		<NavBrand href="/">
			<!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" /> -->
			<span class="self-center whitespace-nowrap text-xl font-semibold text-white">CodinCod</span>
		</NavBrand>

		<NavUl {hidden}>
			<!-- ulClass="flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium justify-center items-center" -->

			<NavLi href={urls.puzzle}>Puzzle</NavLi>
		</NavUl>

		<div class="flex items-center md:order-2 gap-4 w-full">
			<Avatar id="avatar-menu" src={userObject.avaterUrl} />
			<NavHamburger on:click={toggle} class1="w-full md:flex md:w-auto md:order-1" />
		</div>
		<Dropdown placement="bottom" triggeredBy="#avatar-menu">
			<DropdownHeader class="text-sm block">
				{userObject.username}
			</DropdownHeader>
			<DropdownItem><NavLi href={urls.profile}>Profile</NavLi></DropdownItem>
			<DropdownItem><NavLi href={urls.settings}>Settings</NavLi></DropdownItem>
			<DropdownDivider />
			<DropdownItem><NavLi href={urls.signOut}>Sign out</NavLi></DropdownItem>
		</Dropdown>
	</Navbar>
</header>
