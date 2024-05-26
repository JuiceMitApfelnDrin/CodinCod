<script lang="ts">
	import { urls } from "../lib/config/routes";

	let hi = "wassup";
</script>

<div class="container mx-auto">
	<a href={urls.puzzles}>Puzzles</a>
	hi there, {hi}

	<p>
		this will eventually show an overview of the currently on going games and/or games that haven't
		started yet, you can 1v1, 1vX, ...
	</p>
</div>
