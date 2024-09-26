import server from "./app.js";

const FASTIFY_PORT = Number(process.env.PORT) || 8888;

// start server
server.listen({ port: FASTIFY_PORT }, (err) => {
	if (err) {
		server.log.error(err);
		process.exit(1);
	}
});

console.log(`🚀 Fastify server running on port http://localhost:${FASTIFY_PORT}`);
