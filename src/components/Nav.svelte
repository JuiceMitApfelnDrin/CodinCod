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
	<Navbar let:hidden let:toggle navClass="bg-secondary-500 dark:bg-secondary-900">
		<NavBrand href="/">
			<!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" /> -->
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
				CodinCod
			</span>
		</NavBrand>

		<NavHamburger on:click={toggle} />
		<NavUl
			{hidden}
			ulClass="flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium justify-center items-center"
		>
			<NavLi href={urls.root} active={true}>Home</NavLi>

			<div class="flex items-center md:order-2">
				<Avatar id="avatar-menu" src={userObject.avaterUrl} />
				<NavHamburger on:click={toggle} class1="w-full md:flex md:w-auto md:order-1" />
			</div>
			<Dropdown placement="bottom" triggeredBy="#avatar-menu">
				<DropdownHeader>
					<span class="block text-sm">{userObject.username}</span>
				</DropdownHeader>
				<DropdownItem><NavLi href={urls.profile}>Profile</NavLi></DropdownItem>
				<DropdownItem><NavLi href={urls.settings}>Settings</NavLi></DropdownItem>
				<DropdownDivider />
				<DropdownItem><NavLi href={urls.signOut}>Sign out</NavLi></DropdownItem>
			</Dropdown>
		</NavUl>
	</Navbar>
</header>
