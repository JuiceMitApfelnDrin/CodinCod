<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { frontendUrls } from "types";
</script>

<header>
	<nav class="bg-secondary-500 dark:bg-secondary-900 py-4 pb-4">
		<div class="container mx-auto flex flex-row flex-wrap items-center gap-4">
			<a href={frontendUrls.ROOT}>
				<span class="self-center whitespace-nowrap text-xl font-semibold">Codin Cod</span>
			</a>

			<ul class="mx-auto flex flex-row gap-4">
				<li>
					<a href={frontendUrls.PLAY}>Play</a>
				</li>
				<li>
					<a href={frontendUrls.PUZZLES}>Puzzles</a>
				</li>
				<li>
					<a href={frontendUrls.LEARN}>Learn</a>
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
						<DropdownMenu.Item><a href={frontendUrls.USER_PROFILE}>Profile</a></DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</nav>
</header>
