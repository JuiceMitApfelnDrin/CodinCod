export function ensureEnvVar(name: keyof ImportMetaEnv) {
	const value = process.env[name];

	if (value !== null && value !== undefined && typeof value === "string" && value.trim() !== "") {
		return value;
	} else {
		console.error(process.env);
		throw new Error(`Missing environment variable ${name}`);
	}
}
