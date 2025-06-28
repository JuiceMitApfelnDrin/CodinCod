<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";
	import type { DataTestIdProp } from "@/config/test-ids";

	let { ref = $bindable(null), ...restProps }: Button.Props & DataTestIdProp =
		$props();
</script>

<Button.Root bind:ref type="submit" {...restProps} />
