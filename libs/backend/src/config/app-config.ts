import { ZodError, z } from "zod";

const envVarSchema = z.object({
	CODINCOD_BACKEND_PORT: z
		.string()
		.regex(/^\d+$/, { message: "CODINCOD_BACKEND_PORT: must be a number" })
		.optional()
		.default("8888"),
	CODINCOD_COOKIE_SECRET: z.string({
		message: "CODINCOD_COOKIE_SECRET: missing environment variable"
	}),
	CODINCOD_JWT_SECRET: z.string({ message: "CODINCOD_JWT_SECRET: missing environment variable" }),
	CODINCOD_MONGO_DATABASE: z.string().default("codincod"),
	CODINCOD_MONGO_URI: z.string({ message: "CODINCOD_MONGO_URI: missing environment variable" }),
	NODE_ENV: z.enum(["development", "production"]).default("development")
});

let envVars: z.infer<typeof envVarSchema>;
try {
	envVars = envVarSchema.parse(process.env);
} catch (error: unknown) {
	if (error instanceof ZodError) {
		const errorList = error.errors.map((e) => `  - ${e.message}`).join("\n");
		// TODO: is this logged correctly? fastify logging depends on these env vars
		console.error(`Error: Incorrect environment variable configuration\n${errorList}`);
		process.exit(1);
	} else {
		throw error;
	}
}

export const appConfig = {
	env: envVars,
	cookieSecret: envVars.CODINCOD_COOKIE_SECRET,
	dbName: envVars.CODINCOD_MONGO_DATABASE,
	jwtSecret: envVars.CODINCOD_JWT_SECRET,
	mongoUri: envVars.CODINCOD_MONGO_URI,
	port: Number(envVars.CODINCOD_BACKEND_PORT),
	isProduction: envVars.NODE_ENV === "production"
};
