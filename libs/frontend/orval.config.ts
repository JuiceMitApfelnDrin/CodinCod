import { defineConfig } from "orval";

export default defineConfig({
	elixirApi: {
		input: {
			// Point to your Elixir backend OpenAPI spec
			target: "../elixir-backend/codincod_api/priv/static/openapi.json"
		},
		output: {
			mode: "tags-split",
			target: "./src/lib/api/generated/endpoints.ts",
			schemas: "./src/lib/api/generated/schemas",
			client: "fetch", // Use native fetch API
			baseUrl: "", // Will be handled by custom mutator
			mock: false, // Disabled: MSW mock generation has type issues with exactOptionalPropertyTypes
			override: {
				mutator: {
					path: "./src/lib/api/custom-client.ts",
					name: "customClient"
				},
				fetch: {
					includeHttpResponseReturnType: false // Return data directly, not { data, status }
				}
			}
		},
		hooks: {
			afterAllFilesWrite: "prettier --write"
		}
	}
});
