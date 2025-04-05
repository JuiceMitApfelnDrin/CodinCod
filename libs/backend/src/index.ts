import server from "./app.js";

const FASTIFY_HOST = process.env.FASTIFY_HOST ?? "0.0.0.0";
const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 8888;

// start server
server.listen({ port: FASTIFY_PORT, host: FASTIFY_HOST }, (err, address) => {
	if (err) {
		server.log.error(err);
		process.exit(1);
	}

	console.log(`🚀 Fastify server running on port ${address}`);
});
