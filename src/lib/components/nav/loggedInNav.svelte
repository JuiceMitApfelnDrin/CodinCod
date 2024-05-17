<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { urls } from '@/config/routes';
</script>

<header>
	<nav class="bg-secondary-500 dark:bg-secondary-900 p-4">
		<div class="container mx-auto flex flex-row flex-wrap items-center gap-4">
			<a href="/">
				<span class="self-center whitespace-nowrap text-xl font-semibold">Codin Cod</span>
			</a>

			<ul class="ml-auto">
				<li>
					<a href={urls.puzzles}>Puzzles</a>
				</li>
			</ul>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Avatar.Root>
						<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
						<Avatar.Fallback>CN</Avatar.Fallback>
					</Avatar.Root>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item><a href={urls.user_profile}>Profile</a></DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</nav>
</header>
