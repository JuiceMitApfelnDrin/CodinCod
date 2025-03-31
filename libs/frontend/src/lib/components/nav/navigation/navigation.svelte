<script lang="ts">
	import { buildFrontendUrl, frontendUrls } from "types";
	import ToggleTheme from "../toggle-theme.svelte";
	import UserDropdown from "../user-dropdown.svelte";
	import NavigationItem from "./navigation-item.svelte";
	import { isAuthenticated, isDarkTheme, toggleDarkTheme } from "@/stores";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { authenticatedUserInfo } from "@/stores";
	import { Menu, Moon, Sun } from "lucide-svelte";
	import { testIds } from "@/config/test-ids";
</script>

<header class="lg:mx-8">
	<nav
		class="container hidden items-center gap-8 bg-teal-200 bg-gradient-to-b from-teal-100 py-6 text-teal-900 lg:mt-6 lg:flex lg:flex-row lg:rounded-2xl dark:bg-teal-950 dark:from-teal-950 dark:text-teal-100"
	>
		<a href={frontendUrls.ROOT} class="self-center whitespace-nowrap text-4xl font-bold">
			CodinCod
		</a>

		<ul class="mt-3 flex w-full flex-1 flex-row items-center justify-center gap-4">
			<NavigationItem
				data-testid={testIds.NAVIGATION_ANCHOR_HOME}
				href={frontendUrls.ROOT}
				text="Home"
			/>
			<NavigationItem
				data-testid={testIds.NAVIGATION_ANCHOR_PLAY}
				href={frontendUrls.MULTIPLAYER}
				text="Multiplayer"
			/>
			<NavigationItem
				data-testid={testIds.NAVIGATION_ANCHOR_PUZZLES}
				href={frontendUrls.PUZZLES}
				text="Puzzles"
			/>
			<NavigationItem
				data-testid={testIds.NAVIGATION_ANCHOR_LEARN}
				href={frontendUrls.LEARN}
				text="Learn"
			/>
		</ul>

		{#if $isAuthenticated}
			<UserDropdown />
		{:else}
			<a
				data-testid={testIds.NAVIGATION_ANCHOR_LOGIN}
				class="hover:text-foreground dark:hover:text-foreground px-2 pb-2 pt-5 text-sm font-semibold uppercase text-teal-900 underline underline-offset-8 hover:underline hover:underline-offset-2 dark:text-teal-100"
				href={frontendUrls.LOGIN}>Login</a
			>
		{/if}

		<ToggleTheme data-testid={testIds.NAVIGATION_ANCHOR_LEARN} class="mt-2" />
	</nav>

	<div
		class="container flex flex-row items-center justify-between gap-8 bg-teal-200 bg-gradient-to-b from-teal-100 py-6 text-teal-900 lg:hidden dark:bg-teal-950 dark:from-teal-950 dark:text-teal-100"
	>
		<a href={frontendUrls.ROOT}>
			<span class="self-center whitespace-nowrap font-mono text-4xl font-bold">CodinCod</span>
		</a>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Menu />
			</DropdownMenu.Trigger>

			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.Item href={frontendUrls.ROOT}>Home</DropdownMenu.Item>
					<DropdownMenu.Item href={frontendUrls.MULTIPLAYER}>Multiplayer</DropdownMenu.Item>
					<DropdownMenu.Item href={frontendUrls.PUZZLES}>Puzzles</DropdownMenu.Item>
					<DropdownMenu.Item href={frontendUrls.LEARN}>Learn</DropdownMenu.Item>

					{#if $authenticatedUserInfo?.isAuthenticated}
						{@const profileLink = buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
							username: $authenticatedUserInfo.username
						})}
						<DropdownMenu.Item href={profileLink}>Profile</DropdownMenu.Item>
					{/if}

					<DropdownMenu.Separator />

					{#if $authenticatedUserInfo?.isAuthenticated}
						<DropdownMenu.Item href={frontendUrls.SETTINGS_PROFILE}>Settings</DropdownMenu.Item>
					{/if}
					<DropdownMenu.Item on:click={toggleDarkTheme}>
						{#if $isDarkTheme}
							<Moon aria-label="dark mode" />
						{:else}
							<Sun aria-label="light mode" />
						{/if}
					</DropdownMenu.Item>

					<DropdownMenu.Separator />

					{#if $authenticatedUserInfo?.isAuthenticated}
						<DropdownMenu.Item href={frontendUrls.LOGOUT}>Log out</DropdownMenu.Item>
					{:else}
						<DropdownMenu.Item href={frontendUrls.LOGIN}>Login</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
