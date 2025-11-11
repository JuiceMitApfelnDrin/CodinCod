import { defineConfig } from "orval";

export default defineConfig({
	// Generate Zod schemas for runtime validation
	elixirApiZod: {
		input: {
			target: "../backend/codincod_api/priv/static/openapi.json"
		},
		output: {
			mode: "single",
			target: "./src/lib/api/generated/zod-schemas.ts",
			client: "zod",
			override: {
				zod: {
					strict: {
						response: true,
						body: true,
						query: true,
						header: true,
						param: true
					},
					generateEachHttpStatus: false,
					coerce: {
						response: false,
						body: false
					}
				}
			}
		}
	},
	// Generate fetch API client
	elixirApi: {
		input: {
			target: "../backend/codincod_api/priv/static/openapi.json"
		},
		output: {
			mode: "tags-split",
			target: "./src/lib/api/generated/endpoints.ts",
			schemas: "./src/lib/api/generated/schemas",
			client: "fetch",
			baseUrl: "",
			mock: false,
			override: {
				mutator: {
					path: "./src/lib/api/custom-client.ts",
					name: "customClient"
				},
				fetch: {
					includeHttpResponseReturnType: false
				}
			}
		}
	}
});
