import { derived, writable } from "svelte/store";

const now = writable(new Date());

setInterval(() => {
	now.set(new Date());
}, 1000);

export const currentTime = derived(now, (now) => now);
