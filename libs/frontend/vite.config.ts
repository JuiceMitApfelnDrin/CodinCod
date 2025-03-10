import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		plugins: [sveltekit()],
		server: {
			allowedHosts: [".codincod.com"],
			proxy: {
				"/ws": {
					target: env.VITE_BACKEND_WEBSOCKET_MULTIPLAYER,
					ws: true
				}
			}
		}
	};
});
