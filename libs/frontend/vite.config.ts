import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { version } from "./package.json";

process.env.VITE_APP_VERSION = version;

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		defineConfig: {
			"import.meta.env.VITE_APP_VERSION": JSON.stringify(version)
		},
		plugins: [tailwindcss(), sveltekit()],
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
