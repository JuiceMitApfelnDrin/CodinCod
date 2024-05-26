<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";

	import { urls } from "@/config/routes";
</script>

<header>
	<nav class="bg-secondary-500 dark:bg-secondary-900 p-4">
		<div class="container mx-auto flex flex-row flex-wrap items-center gap-4">
			<a href={urls.root}>
				<span class="self-center whitespace-nowrap text-xl font-semibold">Codin Cod</span>
			</a>

			<ul class="mx-auto flex flex-row gap-4">
				<li>
					<a href={urls.play}>Play</a>
				</li>
				<li>
					<a href={urls.puzzles}>Puzzles</a>
				</li>
				<li>
					<a href={urls.learn}>Learn</a>
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
