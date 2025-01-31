declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CODINCOD_BACKEND_PORT?: string;
			CODINCOD_COOKIE_SECRET?: string;
			CODINCOD_JWT_SECRET?: string;
			CODINCOD_MONGO_DATABASE?: string;
			CODINCOD_MONGO_URI?: string;
			NODE_ENV?: string;
		}
	}
}