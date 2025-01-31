// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CODINCOD_BACKEND_URL?: number;
		}
	}

	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				isAuthenticated: boolean;
				username?: string;
				userId?: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

