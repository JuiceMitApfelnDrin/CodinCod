import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { version } from "./package.json";

process.env.VITE_APP_VERSION = version;

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	const backendUrl = env.VITE_ELIXIR_BACKEND_URL || "http://localhost:4000";

	return {
		defineConfig: {
			"import.meta.env.VITE_APP_VERSION": JSON.stringify(version)
		},
		plugins: [tailwindcss(), sveltekit()],
		server: {
			allowedHosts: [".codincod.com"],
			proxy: {
				"/api": {
					target: backendUrl,
					changeOrigin: true,
					secure: false
				},
				"/socket": {
					target: backendUrl.replace(/^http/, "ws"),
					ws: true,
					changeOrigin: true,
					secure: false
				}
			}
		}
	};
});
