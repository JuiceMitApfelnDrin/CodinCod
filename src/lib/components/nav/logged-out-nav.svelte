<script lang="ts">
	import { frontendUrls } from "types";
</script>

<header>
	<nav class="bg-secondary-500 dark:bg-secondary-900 py-4 pb-4">
		<div class="container mx-auto flex flex-row flex-wrap items-center gap-4">
			<a href={frontendUrls.ROOT}>
				<span class="self-center whitespace-nowrap text-xl font-semibold">Codin Cod</span>
			</a>

			<ul class="flex flex-1 flex-row gap-4">
				<li class="ml-auto">
					<a href={frontendUrls.PLAY}>Play</a>
				</li>
				<li>
					<a href={frontendUrls.PUZZLES}>Puzzles</a>
				</li>
				<li>
					<a href={frontendUrls.LEARN}>Learn</a>
				</li>
				<li class="ml-auto">
					<a href={frontendUrls.LOGIN}>Login</a>
				</li>
			</ul>
		</div>
	</nav>
</header>
