import server from "./app.js";

const FASTIFY_HOST = process.env.FASTIFY_HOST ?? "0.0.0.0";
const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 8888;

// Debug: Log environment variables at startup
console.log("=== Environment Configuration ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("================================");

// start server
server.listen({ port: FASTIFY_PORT, host: FASTIFY_HOST }, (err, address) => {
	if (err) {
		server.log.error(err);
		process.exit(1);
	}

	console.log(`🚀 Fastify server running on port ${address}`);
});
